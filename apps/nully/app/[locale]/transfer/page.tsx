"use client";

import { useParams } from "next/navigation";
import { usePeerConnection } from "../../../hooks/use-peer-connection";
import { ShareLinkCard } from "../../../components/share-link-card";
import { ConnectionStatusIndicator } from "../../../components/connection-status-indicator";
import { FileSender } from "../../../components/file-sender";
import { useFileTransfer } from "../../../hooks/use-file-transfer";

export default function TransferPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { peerId, status, error, send, onData } = usePeerConnection();
  const { stageFile, stagedFiles } = useFileTransfer({ send, onData });

  console.log("[TransferPage] Status:", status, "PeerID:", peerId);

  const getShareableUrl = () => {
    if (!peerId) return "";
    return `${window.location.origin}/${locale}/join/${peerId}`;
  };

  if (status === "connecting" || status === "error") {
    return (
      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <ConnectionStatusIndicator status={status} error={error} role="sender" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Send Files</h1>
        <p className="text-gray-600">Share the link below to start transferring files</p>
      </div>

      {peerId && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Peer ID
            </label>
            <code className="block p-2 bg-white border rounded text-sm font-mono">
              {peerId}
            </code>
          </div>

          <ShareLinkCard url={getShareableUrl()} />

          <div className="text-center">
            <ConnectionStatusIndicator status={status} error={error} role="sender" />
          </div>

          {status === 'connected' && (
            <FileSender stageFile={stageFile} stagedFiles={stagedFiles} />
          )}
        </div>
      )}
    </main>
  );
}