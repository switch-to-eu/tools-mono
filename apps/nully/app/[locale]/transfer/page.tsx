"use client";

import { useParams } from "next/navigation";
import { usePeerConnection } from "../../../hooks/use-peer-connection";
import { useFileTransfer } from "../../../hooks/use-file-transfer";
import { SendPage } from "../../../components/send-page";

export default function TransferPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { peerId, status, error, send, onData, onConnect } = usePeerConnection();
  const { stageFile, stagedFiles } = useFileTransfer({ send, onData, onConnect });

  console.log("[TransferPage] Status:", status, "PeerID:", peerId);

  const getShareableUrl = () => {
    if (!peerId) return "";
    return `${window.location.origin}/${locale}/join/${peerId}`;
  };

  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of files) {
      stageFile(file);
    }
  };

  if (status === "connecting" || status === "error") {
    return (
      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl p-4">
      <SendPage
        shareUrl={getShareableUrl()}
        status={status}
        stagedFiles={stagedFiles}
        onSelectFiles={handleSelectFiles}
      />
    </main>
  );
}