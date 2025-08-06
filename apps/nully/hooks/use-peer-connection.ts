import { Peer } from "peerjs";
import type { DataConnection } from "peerjs";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PeerMessage, PeerConnectionMetrics } from "@/lib/interfaces";
import { getPeerConfig, getServerInfo } from "@/lib/peer-config";

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
    const [metrics, setMetrics] = useState<PeerConnectionMetrics>({
        connectionStartTime: Date.now(),
        totalReconnectAttempts: 0,
        errorCount: 0,
    });
    const onDataCallbackRef = useRef<(data: PeerMessage) => void>(() => { });
    const onConnectCallbackRef = useRef<() => void>(() => { });
    const remotePeerIdRef = useRef<string | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const cleanupConnection = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearInterval(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        let newPeer: Peer | null = null;
        let isCancelled = false;
        
        console.log("[usePeerConnection] Initializing peer connection:", getServerInfo());
        
        // Get PeerJS configuration
        const peerConfig = getPeerConfig();
        
        if (isCancelled) return;
        
        console.log("[usePeerConnection] Using", peerConfig.config?.iceServers?.length || 0, "ICE servers");
        
        // Initialize peer with configuration
        newPeer = initialPeerId 
            ? new Peer(initialPeerId, peerConfig) 
            : new Peer(peerConfig);
        
        setPeer(newPeer);
        setStatus("connecting");
        
        // Update metrics
        setMetrics(prev => ({
            ...prev,
            connectionStartTime: Date.now(),
        }));

        newPeer.on("open", (id) => {
            console.log("[usePeerConnection] ✅ Peer ready with ID:", id);
            setPeerId(id);
            setStatus("disconnected"); // Ready, but not connected to a peer yet
            
            // Update connection establishment metrics
            setMetrics(prev => ({
                ...prev,
                connectionEstablishTime: Date.now(),
            }));
        });

        newPeer.on("connection", (conn) => {
            console.log("[usePeerConnection] ✅ Incoming connection from:", conn.peer);
            cleanupConnection();
            setConnection(conn);
            setStatus("connected");

            conn.on("open", () => {
                console.log("[usePeerConnection] Connection established");
                onConnectCallbackRef.current(); // Notify that a connection is established
            });

            conn.on("data", (data) => {
                let message: PeerMessage;
                
                if (typeof data === 'string') {
                    try {
                        message = JSON.parse(data) as PeerMessage;
                    } catch (e) {
                        console.error("[usePeerConnection] Failed to parse message:", e);
                        return;
                    }
                } else if (typeof data === 'object' && data !== null) {
                    message = data as PeerMessage;
                } else {
                    console.error("[usePeerConnection] Unexpected data type:", typeof data);
                    return;
                }
                onDataCallbackRef.current(message);
            });

            conn.on("close", () => {
                console.log("[usePeerConnection] Connection closed");
                setStatus("disconnected");
            });

            conn.on("error", (err) => {
                console.error("[usePeerConnection] Connection error:", err.message);
            });

            // Monitor critical WebRTC connection states
            if (conn.peerConnection) {
                conn.peerConnection.addEventListener('iceconnectionstatechange', () => {
                    if (conn.peerConnection?.iceConnectionState === 'failed') {
                        console.error("[usePeerConnection] 🚨 ICE connection failed - WebRTC cannot connect");
                    }
                });
            }
        });

        newPeer.on("error", (err) => {
            console.error("[usePeerConnection] 🚨 PeerJS error:", err.type, "-", err.message);
            
            setError(err.message);
            setStatus("error");
            
            // Update error metrics
            setMetrics(prev => ({
                ...prev,
                errorCount: prev.errorCount + 1,
                lastError: err.message,
            }));
        });

        newPeer.on("disconnected", () => {
            console.log("[usePeerConnection] Disconnected from server");
            setStatus("disconnected");
        });

        newPeer.on("close", () => {
            console.log("[usePeerConnection] Peer closed");
            setStatus("disconnected");
        });
        

        return () => {
            isCancelled = true;
            console.log("[usePeerConnection] Cleaning up peer");
            cleanupConnection();
            if (newPeer) {
                newPeer.destroy();
            }
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
                remotePeerId
            );
            console.log("[usePeerConnection] Current peer state:", {
                id: peer.id,
                destroyed: peer.destroyed,
                disconnected: peer.disconnected,
                open: peer.open
            });
            remotePeerIdRef.current = remotePeerId;
            const conn = peer.connect(remotePeerId);
            
            console.log("[usePeerConnection] Connection object created:", {
                connectionId: conn?.connectionId,
                open: conn?.open,
                peer: conn?.peer
            });

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
                console.log("[usePeerConnection] ✅ Outgoing connection opened to:", remotePeerId);
                console.log("[usePeerConnection] Connection established successfully:", {
                    peer: remotePeerId,
                    connectionTime: Date.now() - metrics.connectionStartTime + 'ms',
                    reliable: conn.reliable,
                    type: conn.type,
                    timestamp: new Date().toISOString()
                });
                
                if (reconnectTimerRef.current) {
                    clearInterval(reconnectTimerRef.current);
                    reconnectTimerRef.current = null;
                    console.log("[usePeerConnection] Cleared reconnect timer");
                }
                if (connectionTimeoutRef.current) {
                    clearTimeout(connectionTimeoutRef.current);
                    connectionTimeoutRef.current = null;
                    console.log("[usePeerConnection] Cleared connection timeout");
                }
                
                setStatus("connected");
                onConnectCallbackRef.current();
            };

            const handleConnectionClose = () => {
                console.log("[usePeerConnection] ❌ Outgoing connection closed. Will try to reconnect.");
                console.log("[usePeerConnection] Connection close details:", {
                    peer: remotePeerId,
                    connectionDuration: metrics.connectionEstablishTime ? 
                        Date.now() - metrics.connectionEstablishTime + 'ms' : 'unknown',
                    totalAttempts: metrics.totalReconnectAttempts,
                    timestamp: new Date().toISOString()
                });
                
                setStatus("reconnecting");
                
                setMetrics(prev => ({
                    ...prev,
                    lastReconnectAttempt: Date.now(),
                    totalReconnectAttempts: prev.totalReconnectAttempts + 1,
                }));
                
                if (reconnectTimerRef.current) {
                    clearInterval(reconnectTimerRef.current);
                    console.log("[usePeerConnection] Cleared existing reconnect timer");
                }
                
                // Exponential backoff: start with 1s, max 10s
                const baseDelay = 1000;
                const maxDelay = 10000;
                const currentAttempts = metrics.totalReconnectAttempts;
                const backoffFactor = Math.min(maxDelay, baseDelay * Math.pow(2, currentAttempts));
                
                console.log(`[usePeerConnection] 🔄 Reconnecting in ${backoffFactor}ms (attempt #${metrics.totalReconnectAttempts + 1})`);
                
                reconnectTimerRef.current = setTimeout(() => {
                    if (peer && !peer.destroyed && peer.disconnected) {
                        console.log("[usePeerConnection] Peer disconnected from server, reconnecting peer first...");
                        peer.reconnect();
                    }
                    console.log(`[usePeerConnection] Attempting to reconnect to ${remotePeerIdRef.current}...`);
                    connect(remotePeerIdRef.current!);
                }, backoffFactor);
            };

            const handleConnectionData = (data: unknown) => {
                console.log("[usePeerConnection] Data received (outgoing):", {
                    type: typeof data,
                    isString: typeof data === 'string',
                    isObject: typeof data === 'object',
                    messageType: data && typeof data === 'object' ? (data as any).type : 'unknown',
                    size: data && typeof data === 'object' && (data as any).payload ? 
                          ((data as any).payload.chunk ? `${(data as any).payload.chunk.byteLength} bytes` : 'non-chunk') : 
                          (typeof data === 'string' ? `${data.length} chars` : 'unknown')
                });
                let message: PeerMessage;
                if (typeof data === 'string') {
                    try {
                        message = JSON.parse(data as string) as PeerMessage;
                        console.log("[usePeerConnection] Parsed outgoing string message:", message.type);
                    } catch (e) {
                        console.error("[usePeerConnection] Failed to parse string message:", e, data);
                        return;
                    }
                } else if (typeof data === 'object' && data !== null) {
                    message = data as PeerMessage;
                    console.log("[usePeerConnection] Outgoing object message received:", message.type);
                } else {
                    console.error("[usePeerConnection] Received unexpected data type:", typeof data, data);
                    return;
                }
                onDataCallbackRef.current(message);
            };

            const handleConnectionError = (err: Error) => {
                console.error("[usePeerConnection] Outgoing connection error:", {
                    message: err.message,
                    name: err.name,
                    stack: err.stack,
                    remotePeer: remotePeerId,
                    connectionState: {
                        open: conn?.open,
                        peer: conn?.peer
                    }
                });
                setError(err.message);
                setStatus("error");
            };

            cleanupConnection();
            
            // Add WebRTC connection state monitoring for outgoing connections
            if (conn.peerConnection) {
                conn.peerConnection.addEventListener('iceconnectionstatechange', () => {
                    if (conn.peerConnection) {
                        console.log(`[usePeerConnection] ICE connection state (outgoing): ${conn.peerConnection.iceConnectionState}`);
                        if (conn.peerConnection.iceConnectionState === 'failed') {
                            console.error("[usePeerConnection] 🚫 ICE connection failed (outgoing)");
                            console.error("[usePeerConnection] Diagnostics:", {
                                localCandidates: 'Check console for local candidates',
                                remoteCandidates: 'Check console for remote candidates', 
                                turnServers: getIceServerInfo().filter(s => s.startsWith('turn')),
                                suggestion: 'TURN servers may be unreachable or credentials invalid'
                            });
                        }
                    }
                });
                conn.peerConnection.addEventListener('connectionstatechange', () => {
                    if (conn.peerConnection) {
                        console.log(`[usePeerConnection] Connection state (outgoing): ${conn.peerConnection.connectionState}`);
                        if (conn.peerConnection.connectionState === 'failed') {
                            console.error("[usePeerConnection] 🚫 WebRTC connection failed completely");
                        }
                    }
                });
                conn.peerConnection.addEventListener('icegatheringstatechange', () => {
                    if (conn.peerConnection) {
                        console.log(`[usePeerConnection] ICE gathering state (outgoing): ${conn.peerConnection.iceGatheringState}`);
                        if (conn.peerConnection.iceGatheringState === 'complete') {
                            // Log statistics about gathered candidates
                            conn.peerConnection.getStats().then(stats => {
                                const candidates = [];
                                stats.forEach(stat => {
                                    if (stat.type === 'local-candidate') {
                                        candidates.push({
                                            type: stat.candidateType,
                                            protocol: stat.protocol,
                                            address: stat.address || stat.ip,
                                            port: stat.port
                                        });
                                    }
                                });
                                console.log(`[usePeerConnection] 📊 Local candidates gathered:`, candidates);
                            }).catch(e => console.warn('[usePeerConnection] Could not get candidate stats:', e));
                        }
                    }
                });
                conn.peerConnection.addEventListener('icecandidate', (event) => {
                    if (event.candidate) {
                        const candidate = event.candidate;
                        console.log(`[usePeerConnection] ICE candidate found (outgoing):`, {
                            candidate: candidate.candidate,
                            protocol: candidate.protocol,
                            type: candidate.type,
                            foundation: candidate.foundation,
                            priority: candidate.priority,
                            address: candidate.address,
                            port: candidate.port,
                            relatedAddress: candidate.relatedAddress,
                            relatedPort: candidate.relatedPort
                        });
                        
                        // Special logging for TURN candidates
                        if (candidate.type === 'relay') {
                            console.log(`[usePeerConnection] ✅ TURN relay candidate found:`, {
                                serverReflexiveAddress: candidate.relatedAddress,
                                relayAddress: candidate.address,
                                port: candidate.port,
                                protocol: candidate.protocol
                            });
                        }
                    } else {
                        console.log(`[usePeerConnection] ICE gathering completed (outgoing)`);
                    }
                });
            }
            
            conn.on("open", handleConnectionOpen);
            conn.on("data", handleConnectionData);
            conn.on("close", handleConnectionClose);
            conn.on("error", handleConnectionError);

            // Set connection timeout (30 seconds)
            connectionTimeoutRef.current = setTimeout(() => {
                console.log("[usePeerConnection] ⏰ Connection timeout after 30s");
                console.log("[usePeerConnection] Timeout details:", {
                    targetPeer: remotePeerId,
                    connectionState: conn.open ? "open" : "not open",
                    peerState: {
                        id: peer.id,
                        open: peer.open,
                        destroyed: peer.destroyed,
                        disconnected: peer.disconnected
                    },
                    attemptsTotal: metrics.totalReconnectAttempts,
                    timestamp: new Date().toISOString()
                });
                
                setError("Connection timeout - retrying...");
                setStatus("error");
                
                // Trigger retry after timeout
                setTimeout(() => {
                    if (remotePeerIdRef.current) {
                        console.log("[usePeerConnection] Retrying connection after timeout...");
                        connect(remotePeerIdRef.current);
                    }
                }, 2000);
            }, 30000);

            setConnection(conn);
            setStatus("connecting");
        },
        [peer, cleanupConnection],
    );

    const send = useCallback(
        (message: PeerMessage) => {
            console.log("[usePeerConnection] Attempting to send message:", {
                type: message.type,
                hasConnection: !!connection,
                connectionOpen: connection?.open,
                connectionPeer: connection?.peer,
                messageSize: message.type === 'FILE_CHUNK' ? 
                           `${message.payload.chunk.byteLength} bytes` : 
                           'non-chunk'
            });
            
            if (connection && connection.open) {
                // By removing JSON.stringify, we let PeerJS use its default serialization (BinaryPack),
                // which can handle ArrayBuffers correctly.
                connection.send(message);
                console.log("[usePeerConnection] Message sent successfully:", message.type);
            } else {
                console.error(
                    "[usePeerConnection] Cannot send message: no open connection.", {
                    hasConnection: !!connection,
                    connectionOpen: connection?.open,
                    messageType: message.type
                });
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
        metrics,
        connect,
        send,
        onData,
        onConnect,
    };
}