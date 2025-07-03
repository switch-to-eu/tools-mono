import { Peer } from "peerjs";
import type { DataConnection } from "peerjs";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PeerMessage } from "@/lib/interfaces";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected"
    | "error";

export function usePeerConnection() {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [error, setError] = useState<string | null>(null);
    const [connection, setConnection] = useState<DataConnection | null>(null);
    const onDataCallbackRef = useRef<(data: PeerMessage) => void>(() => { });

    useEffect(() => {
        console.log("[usePeerConnection] Initializing new peer");
        const newPeer = new Peer();
        setPeer(newPeer);
        setStatus("connecting");

        newPeer.on("open", (id) => {
            console.log("[usePeerConnection] Peer opened with ID:", id);
            setPeerId(id);
            setStatus("disconnected"); // Ready, but not connected to a peer yet
        });

        newPeer.on("connection", (conn) => {
            console.log("[usePeerConnection] Incoming connection received:", conn.peer);
            setConnection(conn);
            setStatus("connected");

            conn.on("open", () => {
                console.log("[usePeerConnection] Incoming connection opened");
            });

            conn.on("data", (data) => {
                console.log("[usePeerConnection] Data received:", data);
                // Attempt to parse the incoming data as a PeerMessage
                try {
                    const message = JSON.parse(data as string) as PeerMessage;
                    onDataCallbackRef.current(message);
                } catch (e) {
                    console.error("[usePeerConnection] Failed to parse incoming message:", e);
                }
            });

            conn.on("close", () => {
                console.log("[usePeerConnection] Incoming connection closed");
                setStatus("disconnected");
            });
        });

        newPeer.on("error", (err) => {
            console.error("[usePeerConnection] PeerJS error:", err);
            setError(err.message);
            setStatus("error");
        });

        newPeer.on("disconnected", () => {
            console.log("[usePeerConnection] Peer disconnected");
            setStatus("disconnected");
        });

        newPeer.on("close", () => {
            console.log("[usePeerConnection] Peer closed");
            setStatus("disconnected");
        });

        return () => {
            console.log("[usePeerConnection] Cleaning up peer");
            newPeer.destroy();
        };
    }, []);

    const connect = useCallback((remotePeerId: string) => {
        if (!peer) {
            console.log("[usePeerConnection] Cannot connect: peer not initialized");
            return;
        }

        console.log("[usePeerConnection] Attempting to connect to:", remotePeerId);
        const conn = peer.connect(remotePeerId);

        if (!conn) {
            console.error("[usePeerConnection] Connection failed to initialize.");
            setError("Connection failed. The remote peer might be unavailable.");
            setStatus("error");
            return;
        }

        setConnection(conn);
        setStatus("connecting");

        conn.on("open", () => {
            console.log("[usePeerConnection] Outgoing connection opened to:", remotePeerId);
            setStatus("connected");
        });

        conn.on("data", (data) => {
            console.log("[usePeerConnection] Data received on outgoing connection:", data);
            // Attempt to parse the incoming data as a PeerMessage
            try {
                const message = JSON.parse(data as string) as PeerMessage;
                onDataCallbackRef.current(message);
            } catch (e) {
                console.error("[usePeerConnection] Failed to parse incoming message:", e);
            }
        });

        conn.on("close", () => {
            console.log("[usePeerConnection] Outgoing connection closed");
            setStatus("disconnected");
        });

        conn.on("error", (err) => {
            console.error("[usePeerConnection] Outgoing connection error:", err);
            setError(err.message);
            setStatus("error");
        });
    }, [peer]);

    const send = useCallback((message: PeerMessage) => {
        if (connection && connection.open) {
            const serializedMessage = JSON.stringify(message);
            connection.send(serializedMessage);
        } else {
            console.error("[usePeerConnection] Cannot send message: no open connection.");
        }
    }, [connection]);

    const onData = useCallback((callback: (data: PeerMessage) => void) => {
        onDataCallbackRef.current = callback;
    }, []);

    return { peer, peerId, status, error, connection, connect, send, onData };
}