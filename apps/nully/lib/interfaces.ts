export interface FileTransfer {
    file: File;
    id: string;
    progress: number;
    status: "pending" | "transferring" | "done" | "error";
    error?: string;
}

export interface P2PState {
    peerId: string | null;
    isConnecting: boolean;
    isConnected: boolean;
    error: string | null;
}

// P2P Message Protocol
export type MessageType =
    | "GREETING"
    | "FILE_METADATA"
    | "FILE_REQUEST"
    | "FILE_CHUNK"
    | "TRANSFER_COMPLETE"
    | "ERROR";

export interface Message<T extends MessageType, P> {
    type: T;
    payload: P;
}

export type GreetingMessage = Message<"GREETING", { message: string }>;

export interface FileMetadata {
    id: string;
    name: string;
    size: number;
    type: string;
}

export type FileMetadataMessage = Message<"FILE_METADATA", FileMetadata[]>;

export type FileRequestMessage = Message<"FILE_REQUEST", { fileId: string }>;

export interface FileChunk {
    fileId: string;
    chunk: ArrayBuffer;
    chunkIndex: number;
    totalChunks: number;
}
export type FileChunkMessage = Message<"FILE_CHUNK", FileChunk>;

export type TransferCompleteMessage = Message<
    "TRANSFER_COMPLETE",
    { fileId: string }
>;

export type ErrorMessage = Message<"ERROR", { message: string }>;

export type PeerMessage =
    | GreetingMessage
    | FileMetadataMessage
    | FileRequestMessage
    | FileChunkMessage
    | TransferCompleteMessage
    | ErrorMessage;

// PeerJS Configuration Types
export interface PeerConnectionMetrics {
    connectionStartTime: number;
    connectionEstablishTime?: number;
    lastReconnectAttempt?: number;
    totalReconnectAttempts: number;
    errorCount: number;
    lastError?: string;
}

export interface PeerConnectionConfig {
    useCustomServer: boolean;
    serverHost?: string;
    serverPort?: number;
    serverPath?: string;
    secure?: boolean;
    enableMetrics?: boolean;
}