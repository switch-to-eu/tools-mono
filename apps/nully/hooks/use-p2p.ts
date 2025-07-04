"use client";

import { useEffect, useState, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import { P2PState, FileTransfer } from "@/lib/interfaces";

export function useP2P() {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [conn, setConn] = useState<DataConnection | null>(null);
    const [files, setFiles] = useState<FileTransfer[]>([]);
    const [state, setState] = useState<P2PState>({
        peerId: null,
        isConnecting: true,
        isConnected: false,
        error: null,
    });
    const fileChunksRef = useRef<{ [key: string]: ArrayBuffer[] }>({});

    useEffect(() => {
        const newPeer = new Peer();
        setPeer(newPeer);

        newPeer.on("open", (id) => {
            setState((prevState) => ({
                ...prevState,
                peerId: id,
                isConnecting: false,
            }));
        });

        newPeer.on("connection", (newConn) => {
            setConn(newConn);
            setupConnectionHandlers(newConn);
        });

        newPeer.on("error", (err) => {
            setState((prevState) => ({ ...prevState, isConnecting: false, error: err.message }));
        });

        return () => {
            newPeer.destroy();
        };
    }, []);

    function setupConnectionHandlers(connection: DataConnection) {
        connection.on("open", () => {
            setState((prevState) => ({ ...prevState, isConnected: true, error: null }));
        });

        connection.on("data", (data: any) => {
            if (data.type === 'file-info') {
                setFiles(prev => [...prev, { id: data.id, file: new File([], data.name), progress: 0, status: 'transferring' }]);
                fileChunksRef.current[data.id] = [];
            } else if (data.type === 'file-chunk') {
                const chunkList = fileChunksRef.current[data.id];
                if (chunkList) {
                    chunkList.push(data.chunk);
                    const receivedSize = chunkList.reduce((acc, chunk) => acc + chunk.byteLength, 0);
                    const progress = (receivedSize / data.totalSize) * 100;
                    setFiles(prev => prev.map(f => f.id === data.id ? { ...f, progress } : f));
                }
            } else if (data.type === 'file-end') {
                const chunkList = fileChunksRef.current[data.id];
                if (chunkList) {
                    const file = new File(chunkList, data.name, { type: data.fileType });
                    setFiles(prev => prev.map(f => f.id === data.id ? { ...f, file, progress: 100, status: 'done' } : f));
                    delete fileChunksRef.current[data.id];
                }
            }
        });

        connection.on("error", (err) => {
            setState((prevState) => ({ ...prevState, error: err.message }));
        });

        connection.on("close", () => {
            setState((prevState) => ({ ...prevState, isConnected: false }));
            setConn(null);
        });
    }

    function connect(remotePeerId: string) {
        if (!peer) return;
        const newConn = peer.connect(remotePeerId);
        setConn(newConn);
        setupConnectionHandlers(newConn);
    }

    function send(file: File) {
        if (!conn) return;

        const fileId = `${file.name}-${Date.now()}`;
        conn.send({ type: 'file-info', name: file.name, id: fileId, totalSize: file.size });

        const chunkSize = 64 * 1024; // 64KB
        let offset = 0;

        const reader = new FileReader();
        reader.onload = () => {
            const chunk = reader.result as ArrayBuffer;
            conn.send({ type: 'file-chunk', chunk, id: fileId, totalSize: file.size });
            offset += chunk.byteLength;
            if (offset < file.size) {
                readSlice(offset);
            } else {
                conn.send({ type: 'file-end', id: fileId, name: file.name, fileType: file.type });
            }
        };

        function readSlice(o: number) {
            const slice = file.slice(o, o + chunkSize);
            reader.readAsArrayBuffer(slice);
        }
        readSlice(0);
    }

    function clearError() {
        setState((prevState) => ({ ...prevState, error: null }));
    }

    return { state, files, connect, send, clearError };
}