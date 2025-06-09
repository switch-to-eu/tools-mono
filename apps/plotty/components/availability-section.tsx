"use client";

import { useState, useEffect } from "react";
import { Edit, User, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SectionCard, SectionHeader, SectionContent } from "~/components/ui/section-card";
import { AvailabilityForm } from "./availability-form";
import type { DecryptedPoll, Participant } from "~/lib/interfaces";

interface AvailabilitySectionProps {
  poll: DecryptedPoll;
  onSubmitVote: (data: { name: string; availability: Record<string, boolean> }) => Promise<void>;
  isLoading?: boolean;
  defaultName?: string;
}

export function AvailabilitySection({
  poll,
  onSubmitVote,
  isLoading = false,
  defaultName = "",
}: AvailabilitySectionProps) {
  const [participantName, setParticipantName] = useState(defaultName);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [isVoting, setIsVoting] = useState(false);
  const [isExistingParticipant, setIsExistingParticipant] = useState(false);

  // Initialize availability state when poll loads
  useEffect(() => {
    const initialAvailability: Record<string, boolean> = {};
    poll.dates.forEach((date: string) => {
      initialAvailability[date] = false;
    });
    setAvailability(initialAvailability);
  }, [poll]);

  // Set initial name if provided
  useEffect(() => {
    if (defaultName && !participantName) {
      setParticipantName(defaultName);
    }
  }, [defaultName, participantName]);

  // Check for existing participant
  useEffect(() => {
    if (!participantName.trim()) return;

    const existingParticipant = poll.participants.find(
      (p: Participant) => p.name === participantName.trim()
    );

    if (existingParticipant) {
      setIsExistingParticipant(true);
      if (!isVoting) {
        setAvailability(existingParticipant.availability);
      }
    } else {
      setIsExistingParticipant(false);
    }
  }, [poll, participantName, isVoting]);

  const startVoting = () => {
    setIsVoting(true);
  };

  const cancelVoting = () => {
    setIsVoting(false);

    // Reset to existing participant data if applicable
    if (isExistingParticipant) {
      const existingParticipant = poll.participants.find(
        (p) => p.name === participantName.trim()
      );
      if (existingParticipant) {
        setAvailability(existingParticipant.availability);
      }
    }
  };

  const handleFormSubmit = async (data: { name: string; availability: Record<string, boolean> }) => {
    await onSubmitVote(data);
    setParticipantName(data.name);
    setAvailability(data.availability);
    setIsExistingParticipant(true);
    setIsVoting(false);
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={<User className="h-5 w-5" />}
        title="Your Availability"
        description={
          isExistingParticipant
            ? `You've already submitted your availability as "${participantName}"`
            : "Select the dates when you're available"
        }
      />

      <SectionContent className="space-y-6">
        {isVoting ? (
          <AvailabilityForm
            dates={poll.dates}
            onSubmit={handleFormSubmit}
            onCancel={cancelVoting}
            isLoading={isLoading}
            initialData={{
              name: participantName,
              availability: availability,
            }}
            existingParticipants={poll.participants.map(p => p.name)}
            isEditing={isExistingParticipant}
          />
        ) : (
          <div className="space-y-6">
            {isExistingParticipant ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      You&apos;ve submitted your availability
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Recorded as &quot;{participantName}&quot;.
                  </p>
                </div>
                <Button
                  onClick={startVoting}
                  variant="outline"
                  className="h-12 w-full"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Your Availability
                </Button>
              </div>
            ) : (
              <Button
                onClick={startVoting}
                className="h-12 w-full"
              >
                <User className="mr-2 h-4 w-4" />
                Add Your Availability
              </Button>
            )}
          </div>
        )}
      </SectionContent>
    </SectionCard>
  );
}