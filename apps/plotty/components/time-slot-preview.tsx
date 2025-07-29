"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { generateTimeSlotsFromStartTimes, formatTimeSlotRange } from "../lib/time-utils";
import { cn } from "@workspace/ui/lib/utils";

interface TimeSlotPreviewProps {
  selectedStartTimes: string[];
  fixedDuration: number;
  className?: string;
  variant?: "default" | "compact";
}

export const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({
  selectedStartTimes,
  fixedDuration,
  className,
  variant = "default"
}) => {
  const t = useTranslations("poll");

  // Generate time ranges from start times + duration
  const timeRanges = React.useMemo(() => {
    try {
      if (!selectedStartTimes || selectedStartTimes.length === 0 || !fixedDuration) {
        return [];
      }
      return generateTimeSlotsFromStartTimes(selectedStartTimes, fixedDuration);
    } catch (error) {
      return [];
    }
  }, [selectedStartTimes, fixedDuration]);

  // Don't render if no valid time ranges
  if (timeRanges.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Time Ranges Summary */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-neutral-500" />
        <span className="font-medium text-neutral-700">
          {timeRanges.length} time range{timeRanges.length > 1 ? 's' : ''}
        </span>
        <span className="text-neutral-500">
          ({fixedDuration}h each)
        </span>
      </div>

      {variant === "default" && (
        <>
          {/* Time Ranges Display */}
          <div className="space-y-2">
            <p className="text-sm text-neutral-600 font-medium">
              Selected time ranges:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {timeRanges.map((range, index) => (
                <span
                  key={range}
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  )}
                >
                  {range}
                </span>
              ))}
            </div>
          </div>

          {/* Information Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> These time ranges apply to all selected dates
            </p>
          </div>
        </>
      )}

      {variant === "compact" && (
        <div className="text-xs text-neutral-500">
          {timeRanges.length} time range{timeRanges.length > 1 ? 's' : ''} • Applies to all dates
        </div>
      )}
    </div>
  );
};

TimeSlotPreview.displayName = "TimeSlotPreview";