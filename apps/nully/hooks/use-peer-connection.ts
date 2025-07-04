import { Peer } from "peerjs";
import type { DataConnection } from "peerjs";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PeerMessage } from "@/lib/interfaces";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting"
    | "error";

interface PeerConnectionOptions {
    initialPeerId?: string;
}

export function usePeerConnection({ initialPeerId }: PeerConnectionOptions = {}) {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [peerId, setPeerId] = useState<string | null>(initialPeerId || null);
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [error, setError] = useState<string | null>(null);
    const [connection, setConnection] = useState<DataConnection | null>(null);
    const onDataCallbackRef = useRef<(data: PeerMessage) => void>(() => { });
    const onConnectCallbackRef = useRef<() => void>(() => { });
    const remotePeerIdRef = useRef<string | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

    const cleanupConnection = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearInterval(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        console.log("[usePeerConnection] Initializing new peer with ID:", initialPeerId);
        const newPeer = initialPeerId ? new Peer(initialPeerId) : new Peer();
        setPeer(newPeer);
        setStatus("connecting");

        newPeer.on("open", (id) => {
            console.log("[usePeerConnection] Peer opened with ID:", id);
            setPeerId(id);
            setStatus("disconnected"); // Ready, but not connected to a peer yet
        });

        newPeer.on("connection", (conn) => {
            console.log("[usePeerConnection] Incoming connection received:", conn.peer);
            cleanupConnection();
            setConnection(conn);
            setStatus("connected");

            conn.on("open", () => {
                console.log("[usePeerConnection] Incoming connection opened");
                onConnectCallbackRef.current(); // Notify that a connection is established
            });

            conn.on("data", (data) => {
                console.log("[usePeerConnection] Data received:", data);
                let message: PeerMessage;
                // PeerJS will deserialize BinaryPack data back into an object.
                // If it was sent as a string, it will be a string.
                if (typeof data === 'string') {
                    try {
                        message = JSON.parse(data) as PeerMessage;
                    } catch (e) {
                        console.error("[usePeerConnection] Failed to parse string message:", e);
                        return;
                    }
                } else if (typeof data === 'object' && data !== null) {
                    // This should be our FILE_CHUNK message
                    message = data as PeerMessage;
                } else {
                    console.error("[usePeerConnection] Received unexpected data type:", typeof data);
                    return;
                }
                onDataCallbackRef.current(message);
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
            cleanupConnection();
            newPeer.destroy();
        };
    }, [initialPeerId, cleanupConnection]);

    const connect = useCallback(
        (remotePeerId: string) => {
            if (!peer) {
                console.log(
                    "[usePeerConnection] Cannot connect: peer not initialized",
                );
                return;
            }

            console.log(
                "[usePeerConnection] Attempting to connect to:",
                remotePeerId,
            );
            remotePeerIdRef.current = remotePeerId;
            const conn = peer.connect(remotePeerId);

            if (!conn) {
                console.error(
                    "[usePeerConnection] Connection failed to initialize.",
                );
                setError(
                    "Connection failed. The remote peer might be unavailable.",
                );
                setStatus("error");
                return;
            }

            const handleConnectionOpen = () => {
                console.log(
                    "[usePeerConnection] Outgoing connection opened to:",
                    remotePeerId,
                );
                if (reconnectTimerRef.current) {
                    clearInterval(reconnectTimerRef.current);
                    reconnectTimerRef.current = null;
                }
                setStatus("connected");
                onConnectCallbackRef.current();
            };

            const handleConnectionClose = () => {
                console.log("[usePeerConnection] Outgoing connection closed. Will try to reconnect.");
                setStatus("reconnecting");
                if (reconnectTimerRef.current) {
                    clearInterval(reconnectTimerRef.current);
                }
                reconnectTimerRef.current = setInterval(() => {
                    if (peer && !peer.destroyed && peer.disconnected) {
                        console.log("[usePeerConnection] Peer disconnected from server, reconnecting peer...");
                        peer.reconnect();
                    }
                    console.log(`[usePeerConnection] Attempting to reconnect to ${remotePeerIdRef.current}...`);
                    connect(remotePeerIdRef.current!);
                }, 3000);
            };

            const handleConnectionData = (data: unknown) => {
                console.log(
                    "[usePeerConnection] Data received on outgoing connection:",
                    data,
                );
                let message: PeerMessage;
                if (typeof data === 'string') {
                    try {
                        message = JSON.parse(data as string) as PeerMessage;
                    } catch (e) {
                        console.error("[usePeerConnection] Failed to parse string message:", e);
                        return;
                    }
                } else if (typeof data === 'object' && data !== null) {
                    message = data as PeerMessage;
                } else {
                    console.error("[usePeerConnection] Received unexpected data type:", typeof data);
                    return;
                }
                onDataCallbackRef.current(message);
            };

            const handleConnectionError = (err: Error) => {
                console.error(
                    "[usePeerConnection] Outgoing connection error:",
                    err,
                );
                setError(err.message);
                setStatus("error");
            };

            cleanupConnection();
            conn.on("open", handleConnectionOpen);
            conn.on("data", handleConnectionData);
            conn.on("close", handleConnectionClose);
            conn.on("error", handleConnectionError);

            setConnection(conn);
            setStatus("connecting");
        },
        [peer, cleanupConnection],
    );

    const send = useCallback(
        (message: PeerMessage) => {
            if (connection && connection.open) {
                // By removing JSON.stringify, we let PeerJS use its default serialization (BinaryPack),
                // which can handle ArrayBuffers correctly.
                connection.send(message);
            } else {
                console.error(
                    "[usePeerConnection] Cannot send message: no open connection.",
                );
            }
        },
        [connection],
    );

    const onData = useCallback((callback: (data: PeerMessage) => void) => {
        onDataCallbackRef.current = callback;
    }, []);

    const onConnect = useCallback((callback: () => void) => {
        onConnectCallbackRef.current = callback;
    }, []);

    return {
        peer,
        peerId,
        status,
        error,
        connection,
        connect,
        send,
        onData,
        onConnect,
    };
}