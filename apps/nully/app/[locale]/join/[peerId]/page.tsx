"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePeerConnection } from "../../../../hooks/use-peer-connection";
import { useFileTransfer } from "../../../../hooks/use-file-transfer";
import { ReceivePage } from "../../../../components/receive-page";

export default function JoinPage() {
  const params = useParams();
  const senderPeerId = params.peerId as string;
  const { peerId, status, error, connect, send, onData, onConnect } = usePeerConnection();
  const { availableFiles, requestFile } = useFileTransfer({ send, onData, onConnect });

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
      <main className="container mx-auto max-w-2xl p-4 space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg">
            <h3 className="font-semibold mb-2">Connection Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p>{status === "error" ? "Connection failed" : "Connecting..."}</p>
          {senderPeerId && (
            <p className="text-sm text-gray-500">
              Sender ID: <code className="bg-gray-100 px-1 rounded">{senderPeerId}</code>
            </p>
          )}
        </div>
      </main>
    );
  }

  if (status === "reconnecting") {
    return (
      <main className="container mx-auto max-w-2xl p-4 space-y-4">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p>Connection lost. Reconnecting...</p>
          {senderPeerId && (
            <p className="text-sm text-gray-500">
              Attempting to reconnect to: <code className="bg-gray-100 px-1 rounded">{senderPeerId}</code>
            </p>
          )}
        </div>
      </main>
    );
  }

  if (status === "connected") {
    return (
      <main className="container mx-auto max-w-2xl p-4 space-y-4">
        <ReceivePage
          status={status}
          availableFiles={availableFiles}
          onDownload={requestFile}
        />
      </main>
    );
  }

  // Default state (should not reach here normally)
  return (
    <main className="container mx-auto max-w-2xl p-4 space-y-4">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-lg text-gray-600">Preparing to join...</p>
      </div>
    </main>
  );
}