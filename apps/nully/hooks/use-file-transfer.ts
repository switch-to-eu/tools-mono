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
        
        // Start chunking and sending the file
        const chunkSize = 64 * 1024; // 64KB
        const totalChunks = Math.ceil(file.size / chunkSize);
        let chunkIndex = 0;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const chunk = e.target.result as ArrayBuffer;
                // Send chunk without verbose logging
                
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
                    console.log(`[useFileTransfer] ✅ Transfer complete: ${file.name}`);
                }
            }
        };
        
        reader.onerror = (e) => {
            console.error(`[useFileTransfer] ❌ Error reading file: ${file.name}`);
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
        
        if (finalChunks && finalChunks.length === totalChunks && finalChunks.every(c => c)) {
            const fileData = availableFilesRef.current.find(f => f.id === fileId);
            if (!fileData) {
                console.error(`[useFileTransfer] ❌ File metadata not found: ${fileId}`);
                return;
            }

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

            const postDownloadChunks = new Map(receivedChunksRef.current);
            postDownloadChunks.delete(fileId);
            setReceivedChunks(postDownloadChunks);
        }
    }, []);

    useEffect(() => {
        onData((message) => {
            if (message.type === 'FILE_METADATA') {
                console.log("[useFileTransfer] 📋 Received metadata for", message.payload.length, "files");
                setAvailableFiles(message.payload);
            } else if (message.type === 'FILE_REQUEST') {
                handleFileRequest(message.payload.fileId);
            } else if (message.type === 'FILE_CHUNK') {
                handleFileChunk(message);
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
        if (fileData) {
            console.log(`[useFileTransfer] 📥 Requesting: ${fileData.name}`);
        }
        
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