"use client";

import { notFound, useParams } from "next/navigation";

import { PollNotFoundError, DecryptionError } from "@components/error-states";
import { BestTimeHighlight, PollInfo } from "@components/poll-header";
import { useLoadPoll } from "@hooks/useLoadPoll";
import { useVote } from "@hooks/useVote";
import { useUpdatePoll } from "@hooks/useUpdatePoll";
import { useDeletePoll } from "@hooks/useDeletePoll";
import { AdminSection } from "@components/admin-section";
import { PollLoading } from "@components/poll-loading";

import { AvailabilityGrid } from "@components/availability-grid";
import type { PollFormData } from "@/lib/schemas";

export default function AdminPage() {
  const params = useParams();

  const pollId = params.id as string;
  const token = params.token as string;

  // Use the new hook
  const {
    poll,
    isLoading,
    isDecrypting,
    encryptionKey,
    decryptionError,
    pollQueryError,
    topTime,
  } = useLoadPoll({
    pollId,
  });

  // Custom hooks for actions
  const {
    submitVote,
    isLoading: isVoting,
    currentParticipantId,
  } = useVote({
    pollId,
    encryptionKey,
    defaultUserName: "Admin",
  });

  const { updatePoll, isLoading: isUpdating } = useUpdatePoll({
    pollId,
    adminToken: token,
    encryptionKey,
  });

  const { deletePoll, isLoading: isDeleting } = useDeletePoll({
    pollId,
    adminToken: token,
  });

  const onSave = async (name: string, availability: Record<string, boolean>) => {
    if (!poll) return;
    await submitVote(poll, { name, availability });
  };

  const handleUpdatePoll = async (formData: PollFormData) => {
    if (!poll) return;
    await updatePoll(poll, formData);
  };

  // Loading state
  if (isLoading) {
    return <PollLoading showAdminActions={true} />;
  }

  // Error states
  if (pollQueryError) {
    return <PollNotFoundError isAdmin={true} />;
  }

  if (decryptionError) {
    return <DecryptionError error={decryptionError} />;
  }

  // Handle null poll after loading
  if (!poll) {
    return notFound();
  }

  return (
    <>
      <div className="py-0 sm:py-12 lg:py-16 sm:px-4">
        <div className="container mx-auto max-w-4xl space-y-8 !px-0 sm:!px-6 lg:!px-8">
          {/* Poll Header */}
          <PollInfo poll={poll} />

          {/* Admin Section */}
          <AdminSection
            poll={poll}
            pollId={pollId}
            adminToken={token}
            encryptionKey={encryptionKey}
            onUpdatePoll={handleUpdatePoll}
            onDeletePoll={deletePoll}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />

          <BestTimeHighlight poll={poll} bestTime={topTime} />

          {/* Availability Grid Section */}
          <AvailabilityGrid
            poll={poll}
            currentParticipantId={currentParticipantId}
            isSaving={isVoting}
            onSave={onSave}
          />
        </div>
      </div>
    </>
  );
}