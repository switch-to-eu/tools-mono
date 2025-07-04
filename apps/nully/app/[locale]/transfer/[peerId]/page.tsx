"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePeerConnection } from "../../../../hooks/use-peer-connection";
import { useFileTransfer } from "../../../../hooks/use-file-transfer";
import { SendPage } from "../../../../components/send-page";

export default function TransferPage() {
  const params = useParams();
  const locale = params.locale as string;
  const initialPeerId = params.peerId as string;
  const { peerId, status, error, send, onData, onConnect } = usePeerConnection({ initialPeerId });
  const { stageFile, stagedFiles } = useFileTransfer({ send, onData, onConnect });
  const [shareUrl, setShareUrl] = useState("");

  console.log("[TransferPage] Status:", status, "PeerID:", peerId);

  useEffect(() => {
    if (peerId) {
      setShareUrl(`${window.location.origin}/${locale}/join/${peerId}`);
    }
  }, [peerId, locale]);

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
        shareUrl={shareUrl}
        status={status}
        stagedFiles={stagedFiles}
        onSelectFiles={handleSelectFiles}
      />
    </main>
  );
}