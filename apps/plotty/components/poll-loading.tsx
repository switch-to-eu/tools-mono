"use client";

import { SectionCard, SectionHeader, SectionContent } from "@workspace/ui/blocks/section-card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Settings, User, Users, FileText } from "lucide-react";

interface PollLoadingProps {
  showAdminActions?: boolean;
}

export function PollLoading({ showAdminActions = false }: PollLoadingProps) {
  return (
    <div className="py-0 sm:py-12 lg:py-16 sm:px-4">
      <div className="container mx-auto max-w-4xl space-y-8 !px-0 sm:!px-6 lg:!px-8">
        {/* Poll Header Skeleton */}
        <SectionCard>
          <SectionHeader
            icon={<FileText className="h-5 w-5" />}
            title="Loading..."
            description="Loading event details"
          />
          <SectionContent className="text-center">
            <Skeleton className="mx-auto mb-6 h-5 w-1/3" />
            <div className="flex items-center justify-center gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </SectionContent>
        </SectionCard>

        {/* Admin Actions Skeleton (conditional) */}
        {showAdminActions && (
          <SectionCard>
            <SectionHeader
              icon={<Settings className="h-5 w-5" />}
              title="Poll Management"
              description="Loading poll settings"
            />
            <SectionContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-20" />
              </div>
            </SectionContent>
          </SectionCard>
        )}

        {/* Availability Section Skeleton */}
        <SectionCard>
          <SectionHeader
            icon={<User className="h-5 w-5" />}
            title="Your Availability"
            description="Loading availability form"
          />
          <SectionContent className="space-y-6">
            <Skeleton className="h-12 w-full" />
          </SectionContent>
        </SectionCard>

        {/* Results Section Skeleton */}
        <SectionCard>
          <SectionHeader
            icon={<Users className="h-5 w-5" />}
            title="Current Responses"
            description="Loading participant responses"
          />
          <SectionContent>
            <div className="space-y-6">
              {/* Date Results Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Participants Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </SectionContent>
        </SectionCard>
      </div>
    </div>
  );
}