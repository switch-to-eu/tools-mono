"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePeerConnection } from "../../../../hooks/use-peer-connection";
import { ConnectionStatusIndicator } from "../../../../components/connection-status-indicator";
import { FileReceiver } from "../../../../components/file-receiver";
import { useFileTransfer } from "../../../../hooks/use-file-transfer";

export default function JoinPage() {
  const params = useParams();
  const senderPeerId = params.peerId as string;
  const { peerId, status, error, connect, send, onData } = usePeerConnection();
  const { availableFiles, requestFile } = useFileTransfer({ send, onData });

  console.log("[JoinPage] Status:", status, "My PeerID:", peerId, "Sender PeerID:", senderPeerId);

  useEffect(() => {
    // Once our peer is ready and we have the sender's peer ID, attempt to connect
    if (peerId && senderPeerId && status === "disconnected") {
      console.log("[JoinPage] Attempting to connect to sender");
      connect(senderPeerId);
    }
  }, [peerId, senderPeerId, status, connect]);

  if (status === "connecting" || status === "error") {
    return (
      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <ConnectionStatusIndicator status={status} error={error} role="receiver" />
          {senderPeerId && (
            <p className="text-sm text-gray-500">
              Sender ID: <code className="bg-gray-100 px-1 rounded">{senderPeerId}</code>
            </p>
          )}
        </div>
      </main>
    );
  }

  if (status === "connected") {
    return (
      <main className="container mx-auto p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Receive Files</h1>
          <p className="text-gray-600">Connected and ready to receive files</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <ConnectionStatusIndicator status={status} error={error} role="receiver" />

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Peer ID
            </label>
            <code className="block p-2 bg-white border rounded text-sm font-mono">
              {peerId}
            </code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender's Peer ID
            </label>
            <code className="block p-2 bg-white border rounded text-sm font-mono">
              {senderPeerId}
            </code>
          </div>

          <div className="text-center text-sm text-gray-600">
            Waiting for files from sender...
          </div>

          {status === 'connected' && (
            <FileReceiver availableFiles={availableFiles} requestFile={requestFile} />
          )}
        </div>
      </main>
    );
  }

  // Default state (should not reach here normally)
  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-lg text-gray-600">Preparing to join...</p>
      </div>
    </main>
  );
}