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
            console.log("[useFileTransfer] Sent initial file metadata to new peer.");
        }
    }, [send]);

    useEffect(() => {
        onConnect(() => {
            console.log("[useFileTransfer] Peer connected, sending file metadata if available.");
            sendMetadata();
        });
    }, [onConnect, sendMetadata]);

    const handleFileRequest = useCallback((fileId: string) => {
        const file = stagedFilesRef.current.get(fileId);
        if (!file) {
            console.error(`[useFileTransfer] File with ID ${fileId} not found in staged files.`);
            return;
        }

        console.log(`[useFileTransfer] Received request for file: ${file.name}`);
        // Start chunking and sending the file
        const chunkSize = 64 * 1024; // 64KB
        const totalChunks = Math.ceil(file.size / chunkSize);
        let chunkIndex = 0;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const chunkMessage: FileChunkMessage = {
                    type: 'FILE_CHUNK',
                    payload: {
                        fileId,
                        chunk: e.target.result as ArrayBuffer,
                        chunkIndex,
                        totalChunks,
                    }
                };
                send(chunkMessage);

                chunkIndex++;
                if (chunkIndex < totalChunks) {
                    readNextChunk();
                } else {
                    console.log(`[useFileTransfer] Finished sending file: ${file.name}`);
                }
            }
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
        console.log(`[useFileTransfer] Received chunk ${chunkIndex + 1}/${totalChunks} for file ${fileId}`);

        const newReceivedChunks = new Map(receivedChunksRef.current);
        const chunks = newReceivedChunks.get(fileId) || [];
        chunks[chunkIndex] = chunk;
        newReceivedChunks.set(fileId, chunks);
        setReceivedChunks(newReceivedChunks);

        const finalChunks = newReceivedChunks.get(fileId);
        if (finalChunks && finalChunks.length === totalChunks && finalChunks.every(c => c)) {
            const fileData = availableFilesRef.current.find(f => f.id === fileId);
            if (!fileData) {
                console.error(`[useFileTransfer] File metadata for ${fileId} not found.`);
                return;
            }

            const fileBlob = new Blob(finalChunks, { type: fileData.type });
            const url = URL.createObjectURL(fileBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileData.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`[useFileTransfer] File ${fileData.name} successfully downloaded.`);

            const postDownloadChunks = new Map(receivedChunksRef.current);
            postDownloadChunks.delete(fileId);
            setReceivedChunks(postDownloadChunks);
        }
    }, []);

    useEffect(() => {
        onData((message) => {
            if (message.type === 'FILE_METADATA') {
                console.log("[useFileTransfer] Received file metadata:", message.payload);
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
        console.log("[useFileTransfer] Staged file and sent metadata:", file.name);
    };

    const requestFile = (fileId: string) => {
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