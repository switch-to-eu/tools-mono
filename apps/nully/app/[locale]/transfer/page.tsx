"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Peer } from "peerjs";

const generateUniqueId = () => {
  const peer = new Peer();
  return new Promise<string>((resolve) => {
    peer.on("open", (id) => {
      resolve(id);
      peer.destroy();
    });
  });
};

export default function TransferPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;

  useEffect(() => {
    const redirectToRoom = async () => {
      const peerId = await generateUniqueId();
      router.replace(`/${locale}/transfer/${peerId}`);
    };
    redirectToRoom();
  }, [router, locale]);

  return (
    <main className="container mx-auto py-4">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p>Creating a new room...</p>
      </div>
    </main>
  );
}