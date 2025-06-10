"use client";

import { useParams } from "next/navigation";

import { MissingKeyError, PollNotFoundError, DecryptionError } from "@components/error-states";
import { PollHeader } from "@components/poll-header";
import { PollLoading } from "@components/poll-loading";
import { AvailabilityGrid } from "@components/availability-grid";
import { useLoadPoll } from "@hooks/useLoadPoll";
import { useVote } from "@hooks/useVote";

export default function PollPage() {
  const params = useParams();
  const pollId = params.id as string;

  const {
    poll,
    isLoading,
    encryptionKey,
    missingKey,
    decryptionError,
    pollQueryError,
    topTime,
  } = useLoadPoll({ pollId });

  // Use voting hook with user state management
  const {
    submitVote,
    isLoading: isVoting,
    currentParticipantId,
  } = useVote({
    pollId,
    encryptionKey,
  });

  const handleVote = async (name: string, availability: Record<string, boolean>) => {
    if (!poll) return;

    await submitVote(poll, { name, availability });
  };

  // Handle missing encryption key
  if (missingKey) {
    return <MissingKeyError />;
  }

  // Handle decryption errors
  if (decryptionError) {
    return <DecryptionError error={decryptionError} />;
  }

  // Handle poll query errors
  if (pollQueryError || !isLoading && !poll) {
    return <PollNotFoundError />;
  }

  // Show loading state
  if (isLoading || !poll) {
    return <PollLoading />;
  }

  return (
    <div className="py-0 sm:py-12 lg:py-16 sm:px-4">
      <div className="container mx-auto max-w-4xl space-y-8 !px-0 sm:!px-6 lg:!px-8">
        {/* Poll Header */}
        <PollHeader
          poll={poll}
          bestTime={topTime}
        />

        {/* Availability Grid Section */}
        <AvailabilityGrid
          poll={poll}
          currentParticipantId={currentParticipantId}
          isSaving={isVoting}
          onSave={handleVote}
        />
      </div>
    </div>
  );
}