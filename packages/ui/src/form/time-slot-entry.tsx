"use client";

import React from "react";
import { X } from "lucide-react";
import type {
  UseFormSetValue,
  UseFormWatch,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface TimeSlotEntryProps<TFormData extends FieldValues> {
  index: number;
  namePrefix: FieldPath<TFormData>;
  setValue: UseFormSetValue<TFormData>;
  watch: UseFormWatch<TFormData>;
  onRemove: () => void;
  className?: string;
  showRemove?: boolean;
}

// Generate hour options (0-23)
const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00`,
  displayLabel: i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`
}));

// Minutes options (00 or 30)
const minuteOptions = [
  { value: 0, label: "00" },
  { value: 30, label: "30" },
];

// Duration options (1h-8h)
const durationOptions = [
  { value: 1, label: "1h" },
  { value: 2, label: "2h" },
  { value: 3, label: "3h" },
  { value: 4, label: "4h" },
  { value: 5, label: "5h" },
  { value: 6, label: "6h" },
  { value: 7, label: "7h" },
  { value: 8, label: "8h" },
];

// Format time slot range preview
function formatTimeSlotRange(hour: number, minutes: number, duration: number): string {
  const startHour = hour;
  const startMinutes = minutes;
  const endHour = Math.floor((startHour * 60 + startMinutes + duration * 60) / 60) % 24;
  const endMinutes = (startMinutes + (duration * 60) % 60) % 60;
  
  const formatTime = (h: number, m: number) => 
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  
  return `${formatTime(startHour, startMinutes)}-${formatTime(endHour, endMinutes)}`;
}

export const TimeSlotEntry = <TFormData extends FieldValues>({
  index,
  namePrefix,
  setValue,
  watch,
  onRemove,
  className,
  showRemove = true,
}: TimeSlotEntryProps<TFormData>) => {
  // Watch current values
  const hour = watch(`${namePrefix}.${index}.hour` as FieldPath<TFormData>) || 0;
  const minutes = watch(`${namePrefix}.${index}.minutes` as FieldPath<TFormData>) || 0;
  const duration = watch(`${namePrefix}.${index}.duration` as FieldPath<TFormData>) || 1;
  
  // Generate preview
  const preview = formatTimeSlotRange(hour, minutes, duration);
  
  const handleHourChange = (newHour: number) => {
    setValue(`${namePrefix}.${index}.hour` as FieldPath<TFormData>, newHour as any);
  };
  
  const handleMinutesChange = (newMinutes: number) => {
    setValue(`${namePrefix}.${index}.minutes` as FieldPath<TFormData>, newMinutes as any);
  };
  
  const handleDurationChange = (newDuration: number) => {
    setValue(`${namePrefix}.${index}.duration` as FieldPath<TFormData>, newDuration as any);
  };

  return (
    <div className={cn("border rounded-lg p-4 space-y-4", className)}>
      {/* Header with preview and remove button */}
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm text-neutral-900">
          {preview}
        </div>
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-neutral-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Time inputs row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hour dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-700">
            Hour
          </Label>
          <select
            value={hour}
            onChange={(e) => handleHourChange(Number(e.target.value))}
            className="h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {hourOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.displayLabel}
              </option>
            ))}
          </select>
        </div>
        
        {/* Minutes toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-700">
            Minutes
          </Label>
          <div className="flex rounded-md border border-gray-300 bg-background">
            {minuteOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleMinutesChange(option.value)}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                  "first:rounded-l-md last:rounded-r-md",
                  minutes === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Duration dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-700">
            Duration
          </Label>
          <select
            value={duration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            className="h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

TimeSlotEntry.displayName = "TimeSlotEntry";