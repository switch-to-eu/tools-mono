"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type {
    FileMetadata,
    FileMetadataMessage,
    FileRequestMessage,
    FileChunkMessage,
    PeerMessage,
    SessionAnalytics,
    FileDownloadStats
} from "@/lib/interfaces";
import { v4 as uuidv4 } from 'uuid';

export type { FileMetadata };

// Download state interfaces
export interface DownloadProgress {
    bytesReceived: number;
    totalBytes: number;
    percentage: number;
    speed: number; // MB/s
    eta: number; // seconds
    startTime: number;
}

export interface DownloadState {
    status: 'idle' | 'downloading' | 'completed' | 'failed';
    activeFileId: string | null;
    progress: DownloadProgress | null;
    error: string | null;
}

interface UseFileTransferProps {
    send: (message: PeerMessage) => void;
    onData: (callback: (data: PeerMessage) => void) => void;
    onConnect: (callback: () => void) => void;
}

export function useFileTransfer({ send, onData, onConnect }: UseFileTransferProps) {
    const [stagedFiles, setStagedFiles] = useState<Map<string, File>>(new Map());
    const [availableFiles, setAvailableFiles] = useState<FileMetadata[]>([]);
    const [receivedChunks, setReceivedChunks] = useState<Map<string, ArrayBuffer[]>>(new Map());
    
    // New download state
    const [downloadState, setDownloadState] = useState<DownloadState>({
        status: 'idle',
        activeFileId: null,
        progress: null,
        error: null,
    });

    // Sender-side analytics state
    const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics>({
        sessionStartTime: Date.now(),
        totalDownloads: 0,
        totalBytesTransferred: 0,
        fileStats: new Map<string, FileDownloadStats>(),
    });

    // Active transfers tracking (sender side)
    const [activeTransfers, setActiveTransfers] = useState<Set<string>>(new Set());

    // Upload progress tracking (sender side)
    const [uploadProgress, setUploadProgress] = useState<Map<string, DownloadProgress>>(new Map());

    const stagedFilesRef = useRef(stagedFiles);
    stagedFilesRef.current = stagedFiles;

    const availableFilesRef = useRef(availableFiles);
    availableFilesRef.current = availableFiles;

    const receivedChunksRef = useRef(receivedChunks);
    receivedChunksRef.current = receivedChunks;

    const downloadStateRef = useRef(downloadState);
    downloadStateRef.current = downloadState;

    // Progress calculation utilities
    const calculateProgress = useCallback((bytesReceived: number, totalBytes: number, startTime: number): DownloadProgress => {
        const percentage = totalBytes > 0 ? Math.round((bytesReceived / totalBytes) * 100) : 0;
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        
        // Calculate speed in MB/s (using rolling average approach)
        const speed = elapsedSeconds > 0 ? (bytesReceived / 1024 / 1024) / elapsedSeconds : 0;
        
        // Calculate ETA in seconds
        const remainingBytes = totalBytes - bytesReceived;
        const eta = speed > 0 ? remainingBytes / (speed * 1024 * 1024) : Infinity;
        
        return {
            bytesReceived,
            totalBytes,
            percentage,
            speed: Math.round(speed * 100) / 100, // Round to 2 decimal places
            eta: isFinite(eta) ? Math.round(eta) : 0,
            startTime,
        };
    }, []);

    // Throttled progress update to avoid UI flooding
    const throttledUpdateProgress = useMemo(() => {
        let lastUpdate = 0;
        const THROTTLE_MS = 500; // Update UI every 500ms max
        
        return (fileId: string, bytesReceived: number, totalBytes: number, startTime: number) => {
            const now = Date.now();
            if (now - lastUpdate >= THROTTLE_MS || bytesReceived === totalBytes) {
                lastUpdate = now;
                const progress = calculateProgress(bytesReceived, totalBytes, startTime);
                setDownloadState(prev => ({
                    ...prev,
                    progress,
                }));
            }
        };
    }, [calculateProgress]);

    const sendMetadata = useCallback(() => {
        const metadata: FileMetadata[] = Array.from(stagedFilesRef.current.entries()).map(([id, f]) => ({
            id,
            name: f.name,
            size: f.size,
            type: f.type,
        }));

        if (metadata.length > 0) {
            const message: FileMetadataMessage = {
                type: "FILE_METADATA",
                payload: metadata,
            };
            send(message);
            console.log("[useFileTransfer] Sent metadata for", metadata.length, "files");
        }
    }, [send]);

    useEffect(() => {
        onConnect(() => {
            sendMetadata();
        });
    }, [onConnect, sendMetadata]);

    const handleFileRequest = useCallback((fileId: string) => {
        const file = stagedFilesRef.current.get(fileId);
        if (!file) {
            console.error(`[useFileTransfer] ❌ File not found: ${fileId}`);
            return;
        }

        console.log(`[useFileTransfer] 📤 Starting transfer: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        
        // Track active transfer
        setActiveTransfers(prev => new Set(prev).add(fileId));
        
        // Initialize upload progress
        const startTime = Date.now();
        setUploadProgress(prev => new Map(prev).set(fileId, {
            bytesReceived: 0,
            totalBytes: file.size,
            percentage: 0,
            speed: 0,
            eta: 0,
            startTime,
        }));
        
        // Start chunking and sending the file
        const chunkSize = 64 * 1024; // 64KB
        const totalChunks = Math.ceil(file.size / chunkSize);
        let chunkIndex = 0;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const chunk = e.target.result as ArrayBuffer;
                
                const chunkMessage: FileChunkMessage = {
                    type: 'FILE_CHUNK',
                    payload: {
                        fileId,
                        chunk,
                        chunkIndex,
                        totalChunks,
                    }
                };
                send(chunkMessage);

                // Update upload progress
                const bytesSent = (chunkIndex + 1) * chunkSize;
                const actualBytesSent = Math.min(bytesSent, file.size);
                const progress = calculateProgress(actualBytesSent, file.size, startTime);
                setUploadProgress(prev => new Map(prev).set(fileId, progress));

                chunkIndex++;
                if (chunkIndex < totalChunks) {
                    readNextChunk();
                } else {
                    console.log(`[useFileTransfer] ✅ Transfer complete: ${file.name}`);
                    
                    // Update analytics when transfer completes
                    setSessionAnalytics(prev => {
                        const newFileStats = new Map(prev.fileStats);
                        const existingStats = newFileStats.get(fileId);
                        const newStats: FileDownloadStats = {
                            fileId,
                            fileName: file.name,
                            downloadCount: (existingStats?.downloadCount || 0) + 1,
                            lastDownloadTime: Date.now(),
                            totalBytesTransferred: (existingStats?.totalBytesTransferred || 0) + file.size,
                        };
                        newFileStats.set(fileId, newStats);

                        return {
                            ...prev,
                            totalDownloads: prev.totalDownloads + 1,
                            totalBytesTransferred: prev.totalBytesTransferred + file.size,
                            fileStats: newFileStats,
                        };
                    });
                    
                    // Remove from active transfers and upload progress
                    setActiveTransfers(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(fileId);
                        return newSet;
                    });
                    setUploadProgress(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(fileId);
                        return newMap;
                    });
                }
            }
        };
        
        reader.onerror = (e) => {
            console.error(`[useFileTransfer] ❌ Error reading file: ${file.name}`);
            // Remove from active transfers and upload progress on error
            setActiveTransfers(prev => {
                const newSet = new Set(prev);
                newSet.delete(fileId);
                return newSet;
            });
            setUploadProgress(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
            });
        };

        const readNextChunk = () => {
            const start = chunkIndex * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            reader.readAsArrayBuffer(file.slice(start, end));
        };

        readNextChunk();
    }, [send]);

    const handleFileChunk = useCallback((message: FileChunkMessage) => {
        const { fileId, chunk, chunkIndex, totalChunks } = message.payload;

        const newReceivedChunks = new Map(receivedChunksRef.current);
        const chunks = newReceivedChunks.get(fileId) || [];
        chunks[chunkIndex] = chunk;
        newReceivedChunks.set(fileId, chunks);
        setReceivedChunks(newReceivedChunks);

        const finalChunks = newReceivedChunks.get(fileId);
        
        // Update progress if this is the active download
        if (downloadStateRef.current.activeFileId === fileId && downloadStateRef.current.status === 'downloading' && downloadStateRef.current.progress) {
            const receivedChunksCount = finalChunks ? finalChunks.filter(c => c).length : 0;
            const bytesReceived = receivedChunksCount * 64 * 1024; // 64KB per chunk
            
            throttledUpdateProgress(fileId, bytesReceived, downloadStateRef.current.progress.totalBytes, downloadStateRef.current.progress.startTime);
        }
        
        if (finalChunks && finalChunks.length === totalChunks && finalChunks.every(c => c)) {
            const fileData = availableFilesRef.current.find(f => f.id === fileId);
            if (!fileData) {
                console.error(`[useFileTransfer] ❌ File metadata not found: ${fileId}`);
                setDownloadState(prev => ({
                    ...prev,
                    status: 'failed',
                    error: 'File metadata not found',
                }));
                return;
            }

            try {
                console.log(`[useFileTransfer] 📥 Download ready: ${fileData.name}`);

                const fileBlob = new Blob(finalChunks, { type: fileData.type });
                const url = URL.createObjectURL(fileBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileData.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                console.log(`[useFileTransfer] ✅ Downloaded: ${fileData.name}`);

                // Send download complete notification
                const downloadCompleteMessage = {
                    type: "DOWNLOAD_COMPLETE" as const,
                    payload: { 
                        fileId, 
                        success: true, 
                        timestamp: Date.now() 
                    },
                };
                send(downloadCompleteMessage);

                // Mark download as completed
                setDownloadState(prev => ({
                    ...prev,
                    status: 'completed',
                    progress: prev.progress ? {
                        ...prev.progress,
                        percentage: 100,
                        bytesReceived: prev.progress.totalBytes,
                    } : null,
                }));

                const postDownloadChunks = new Map(receivedChunksRef.current);
                postDownloadChunks.delete(fileId);
                setReceivedChunks(postDownloadChunks);
            } catch (error) {
                console.error(`[useFileTransfer] ❌ Error downloading file: ${fileData.name}`, error);
                
                // Send download error notification
                const downloadErrorMessage = {
                    type: "DOWNLOAD_ERROR" as const,
                    payload: { 
                        fileId, 
                        error: error instanceof Error ? error.message : 'Unknown error', 
                        timestamp: Date.now() 
                    },
                };
                send(downloadErrorMessage);
                
                setDownloadState(prev => ({
                    ...prev,
                    status: 'failed',
                    error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                }));
            }
        }
    }, [throttledUpdateProgress]);

    useEffect(() => {
        onData((message) => {
            if (message.type === 'FILE_METADATA') {
                console.log("[useFileTransfer] 📋 Received metadata for", message.payload.length, "files");
                setAvailableFiles(message.payload);
            } else if (message.type === 'FILE_REQUEST') {
                handleFileRequest(message.payload.fileId);
            } else if (message.type === 'FILE_CHUNK') {
                handleFileChunk(message);
            } else if (message.type === 'DOWNLOAD_START') {
                console.log(`[useFileTransfer] 📥 Download started: ${message.payload.fileId}`);
                // Sender receives notification that download has started
            } else if (message.type === 'DOWNLOAD_COMPLETE') {
                console.log(`[useFileTransfer] ✅ Download completed: ${message.payload.fileId}, success: ${message.payload.success}`);
                // Sender receives notification that download completed successfully
            } else if (message.type === 'DOWNLOAD_ERROR') {
                console.log(`[useFileTransfer] ❌ Download error: ${message.payload.fileId}, error: ${message.payload.error}`);
                // Sender receives notification that download failed
            }
        });
    }, [onData, handleFileRequest, handleFileChunk]);

    const stageFile = (file: File) => {
        const fileId = uuidv4();
        console.log("[useFileTransfer] 📁 Staged:", file.name, `(${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        
        const newStagedFiles = new Map(stagedFiles);
        newStagedFiles.set(fileId, file);
        setStagedFiles(newStagedFiles);

        const metadata: FileMetadata[] = Array.from(newStagedFiles.entries()).map(([id, f]) => ({
            id,
            name: f.name,
            size: f.size,
            type: f.type,
        }));

        const message: FileMetadataMessage = {
            type: "FILE_METADATA",
            payload: metadata,
        };
        send(message);
    };

    const requestFile = (fileId: string) => {
        const fileData = availableFiles.find(f => f.id === fileId);
        if (!fileData) {
            console.error(`[useFileTransfer] ❌ File metadata not found: ${fileId}`);
            return;
        }

        // Prevent multiple simultaneous downloads
        if (downloadState.status === 'downloading') {
            console.warn(`[useFileTransfer] ⚠️ Download already in progress: ${downloadState.activeFileId}`);
            return;
        }

        console.log(`[useFileTransfer] 📥 Requesting: ${fileData.name}`);
        
        // Initialize download state
        setDownloadState({
            status: 'downloading',
            activeFileId: fileId,
            progress: {
                bytesReceived: 0,
                totalBytes: fileData.size,
                percentage: 0,
                speed: 0,
                eta: 0,
                startTime: Date.now(),
            },
            error: null,
        });
        
        const message: FileRequestMessage = {
            type: "FILE_REQUEST",
            payload: { fileId },
        };
        send(message);
        
        // Send download start notification
        const downloadStartMessage = {
            type: "DOWNLOAD_START" as const,
            payload: { 
                fileId, 
                timestamp: Date.now() 
            },
        };
        send(downloadStartMessage);
        
        console.log(`[useFileTransfer] Sent request for file: ${fileId}`);
    };

    // Clear download error and reset to idle state
    const clearDownloadError = useCallback(() => {
        setDownloadState({
            status: 'idle',
            activeFileId: null,
            progress: null,
            error: null,
        });
    }, []);

    return {
        stageFile,
        requestFile,
        clearDownloadError,
        stagedFiles: Array.from(stagedFiles.entries()).map(([fileId, file]) => ({ fileId, file })),
        availableFiles,
        downloadState,
        sessionAnalytics,
        activeTransfers,
        uploadProgress,
    };
}