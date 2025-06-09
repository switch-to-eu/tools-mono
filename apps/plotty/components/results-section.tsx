"use client";

import { format } from "date-fns";
import { Users } from "lucide-react";
import { SectionCard, SectionHeader, SectionContent } from "~/components/ui/section-card";
import type { DecryptedPoll, Participant } from "~/lib/interfaces";

interface BestTime {
  key: string;
  date: string;
  count: number;
  percentage: number;
}

interface ResultsSectionProps {
  poll: DecryptedPoll;
  bestTimes: BestTime[];
  title?: string;
  description?: string;
  showTopDates?: number;
}

export function ResultsSection({
  poll,
  bestTimes,
  title = "Current Responses",
  description,
  showTopDates = 5,
}: ResultsSectionProps) {
  if (poll.participants.length === 0) {
    return null;
  }

  const defaultDescription = `${poll.participants.length} ${poll.participants.length === 1 ? "person has" : "people have"} responded`;

  return (
    <SectionCard>
      <SectionHeader
        icon={<Users className="h-5 w-5" />}
        title={title}
        description={description ?? defaultDescription}
      />
      <SectionContent>
        <div className="space-y-6">
          {/* Date Results Overview */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Date Options</h4>
            {bestTimes.slice(0, showTopDates).map((timeSlot, index) => (
              <div
                key={timeSlot.key}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(timeSlot.date), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {timeSlot.count}/{poll.participants.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {timeSlot.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Participants List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Participants</h4>
            <div className="space-y-4">
              {poll.participants.map((participant: Participant, index: number) => {
                const availableCount = Object.values(participant.availability).filter(Boolean).length;
                const totalSlots = poll.dates.length;
                const percentage = totalSlots > 0 ? Math.round((availableCount / totalSlots) * 100) : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {participant.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {availableCount} / {totalSlots} available ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionContent>
    </SectionCard>
  );
}