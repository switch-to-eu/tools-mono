"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
    FileMetadata,
    FileMetadataMessage,
    FileRequestMessage,
    FileChunkMessage,
    PeerMessage
} from "@/lib/interfaces";
import { v4 as uuidv4 } from 'uuid';

export type { FileMetadata };

interface UseFileTransferProps {
    send: (message: PeerMessage) => void;
    onData: (callback: (data: PeerMessage) => void) => void;
    onConnect: (callback: () => void) => void;
}

export function useFileTransfer({ send, onData, onConnect }: UseFileTransferProps) {
    const [stagedFiles, setStagedFiles] = useState<Map<string, File>>(new Map());
    const [availableFiles, setAvailableFiles] = useState<FileMetadata[]>([]);
    const [receivedChunks, setReceivedChunks] = useState<Map<string, ArrayBuffer[]>>(new Map());

    const stagedFilesRef = useRef(stagedFiles);
    stagedFilesRef.current = stagedFiles;

    const availableFilesRef = useRef(availableFiles);
    availableFilesRef.current = availableFiles;

    const receivedChunksRef = useRef(receivedChunks);
    receivedChunksRef.current = receivedChunks;

    const sendMetadata = useCallback(() => {
        const metadata: FileMetadata[] = Array.from(stagedFilesRef.current.entries()).map(([id, f]) => ({
            id,
            name: f.name,
            size: f.size,
            type: f.type,
        }));

        console.log("[useFileTransfer] Preparing to send metadata:", {
            fileCount: metadata.length,
            files: metadata.map(f => ({ name: f.name, size: f.size, type: f.type }))
        });

        if (metadata.length > 0) {
            const message: FileMetadataMessage = {
                type: "FILE_METADATA",
                payload: metadata,
            };
            send(message);
            console.log("[useFileTransfer] Sent initial file metadata to new peer:", metadata);
        } else {
            console.log("[useFileTransfer] No files to send metadata for");
        }
    }, [send]);

    useEffect(() => {
        onConnect(() => {
            console.log("[useFileTransfer] Peer connected, sending file metadata if available.");
            sendMetadata();
        });
    }, [onConnect, sendMetadata]);

    const handleFileRequest = useCallback((fileId: string) => {
        console.log(`[useFileTransfer] Processing file request for ID: ${fileId}`);
        console.log("[useFileTransfer] Available staged files:", Array.from(stagedFilesRef.current.keys()));
        
        const file = stagedFilesRef.current.get(fileId);
        if (!file) {
            console.error(`[useFileTransfer] File with ID ${fileId} not found in staged files.`, {
                requestedId: fileId,
                availableIds: Array.from(stagedFilesRef.current.keys())
            });
            return;
        }

        console.log(`[useFileTransfer] Received request for file: ${file.name}`, {
            fileId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });
        // Start chunking and sending the file
        const chunkSize = 64 * 1024; // 64KB
        const totalChunks = Math.ceil(file.size / chunkSize);
        let chunkIndex = 0;
        
        console.log(`[useFileTransfer] Starting file transfer:`, {
            fileName: file.name,
            totalSize: file.size,
            chunkSize,
            totalChunks
        });

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const chunk = e.target.result as ArrayBuffer;
                console.log(`[useFileTransfer] Sending chunk ${chunkIndex + 1}/${totalChunks}:`, {
                    fileId,
                    fileName: file.name,
                    chunkIndex,
                    chunkSize: chunk.byteLength,
                    totalChunks,
                    progress: `${Math.round(((chunkIndex + 1) / totalChunks) * 100)}%`
                });
                
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

                chunkIndex++;
                if (chunkIndex < totalChunks) {
                    readNextChunk();
                } else {
                    console.log(`[useFileTransfer] Finished sending file: ${file.name}`, {
                        totalChunks,
                        totalSize: file.size
                    });
                }
            }
        };
        
        reader.onerror = (e) => {
            console.error(`[useFileTransfer] Error reading file chunk:`, {
                fileName: file.name,
                chunkIndex,
                error: e
            });
        };

        const readNextChunk = () => {
            const start = chunkIndex * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            console.log(`[useFileTransfer] Reading chunk ${chunkIndex + 1}/${totalChunks}:`, {
                start,
                end,
                chunkSize: end - start,
                fileName: file.name
            });
            reader.readAsArrayBuffer(file.slice(start, end));
        };

        readNextChunk();
    }, [send]);

    const handleFileChunk = useCallback((message: FileChunkMessage) => {
        const { fileId, chunk, chunkIndex, totalChunks } = message.payload;
        
        console.log(`[useFileTransfer] Received chunk ${chunkIndex + 1}/${totalChunks} for file ${fileId}`, {
            chunkSize: chunk.byteLength,
            progress: `${Math.round(((chunkIndex + 1) / totalChunks) * 100)}%`,
            fileId
        });

        const newReceivedChunks = new Map(receivedChunksRef.current);
        const chunks = newReceivedChunks.get(fileId) || [];
        chunks[chunkIndex] = chunk;
        newReceivedChunks.set(fileId, chunks);
        setReceivedChunks(newReceivedChunks);

        const finalChunks = newReceivedChunks.get(fileId);
        const receivedCount = finalChunks?.filter(c => c).length || 0;
        
        console.log(`[useFileTransfer] Chunk storage progress:`, {
            fileId,
            receivedCount,
            totalChunks,
            isComplete: finalChunks && finalChunks.length === totalChunks && finalChunks.every(c => c)
        });
        
        if (finalChunks && finalChunks.length === totalChunks && finalChunks.every(c => c)) {
            const fileData = availableFilesRef.current.find(f => f.id === fileId);
            if (!fileData) {
                console.error(`[useFileTransfer] File metadata for ${fileId} not found.`, {
                    fileId,
                    availableFiles: availableFilesRef.current.map(f => ({ id: f.id, name: f.name }))
                });
                return;
            }

            console.log(`[useFileTransfer] All chunks received, creating download:`, {
                fileName: fileData.name,
                fileSize: fileData.size,
                totalChunks,
                chunksReceived: finalChunks.length
            });

            const fileBlob = new Blob(finalChunks, { type: fileData.type });
            const url = URL.createObjectURL(fileBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileData.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`[useFileTransfer] File ${fileData.name} successfully downloaded.`, {
                actualSize: fileBlob.size,
                expectedSize: fileData.size,
                mimeType: fileData.type
            });

            const postDownloadChunks = new Map(receivedChunksRef.current);
            postDownloadChunks.delete(fileId);
            setReceivedChunks(postDownloadChunks);
        }
    }, []);

    useEffect(() => {
        onData((message) => {
            console.log(`[useFileTransfer] Processing message type: ${message.type}`);
            
            if (message.type === 'FILE_METADATA') {
                console.log("[useFileTransfer] Received file metadata:", {
                    fileCount: message.payload.length,
                    files: message.payload.map(f => ({
                        id: f.id,
                        name: f.name,
                        size: f.size,
                        type: f.type
                    }))
                });
                setAvailableFiles(message.payload);
            } else if (message.type === 'FILE_REQUEST') {
                console.log("[useFileTransfer] Received file request:", message.payload);
                handleFileRequest(message.payload.fileId);
            } else if (message.type === 'FILE_CHUNK') {
                handleFileChunk(message);
            } else {
                console.log(`[useFileTransfer] Ignoring message type: ${message.type}`);
            }
        });
    }, [onData, handleFileRequest, handleFileChunk]);

    const stageFile = (file: File) => {
        const fileId = uuidv4();
        console.log("[useFileTransfer] Staging new file:", {
            fileId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            lastModified: new Date(file.lastModified).toISOString()
        });
        
        const newStagedFiles = new Map(stagedFiles);
        newStagedFiles.set(fileId, file);
        setStagedFiles(newStagedFiles);

        const metadata: FileMetadata[] = Array.from(newStagedFiles.entries()).map(([id, f]) => ({
            id,
            name: f.name,
            size: f.size,
            type: f.type,
        }));

        console.log("[useFileTransfer] Prepared metadata for transmission:", {
            totalFiles: metadata.length,
            newFileId: fileId,
            allFiles: metadata.map(f => ({ id: f.id, name: f.name }))
        });

        const message: FileMetadataMessage = {
            type: "FILE_METADATA",
            payload: metadata,
        };
        send(message);
        console.log("[useFileTransfer] Staged file and sent metadata:", file.name);
    };

    const requestFile = (fileId: string) => {
        const fileData = availableFiles.find(f => f.id === fileId);
        console.log(`[useFileTransfer] Requesting file:`, {
            fileId,
            fileName: fileData?.name,
            fileSize: fileData?.size,
            availableFiles: availableFiles.map(f => ({ id: f.id, name: f.name }))
        });
        
        const message: FileRequestMessage = {
            type: "FILE_REQUEST",
            payload: { fileId },
        };
        send(message);
        console.log(`[useFileTransfer] Sent request for file: ${fileId}`);
    };

    return {
        stageFile,
        requestFile,
        stagedFiles: Array.from(stagedFiles.values()),
        availableFiles,
    };
}