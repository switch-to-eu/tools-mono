"use client";

import React from "react";
import { useTranslations } from "next-intl";
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

interface StartTimeEntryProps<TFormData extends FieldValues> {
  index: number;
  namePrefix: FieldPath<TFormData>;
  setValue: UseFormSetValue<TFormData>;
  watch: UseFormWatch<TFormData>;
  onRemove: () => void;
  className?: string;
  showRemove?: boolean;
  duration?: number; // External duration for preview calculation
  formatTimeSlot?: (hour: number, minutes: number, duration: number) => string;
}

// Generate hour options (0-23)
const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00`,
  displayLabel: i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`
}));

// Minutes options (15-minute intervals)
const minuteOptions = [
  { value: 0, label: "00" },
  { value: 15, label: "15" },
  { value: 30, label: "30" },
  { value: 45, label: "45" },
];

// Default formatting function if none provided
function defaultFormatTimeSlot(hour: number, minutes: number, duration: number): string {
  const startHour = hour;
  const startMinutes = minutes;
  const endHour = Math.floor((startHour * 60 + startMinutes + duration * 60) / 60) % 24;
  const endMinutes = (startMinutes + (duration * 60) % 60) % 60;
  
  const formatTime = (h: number, m: number) => 
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  
  return `${formatTime(startHour, startMinutes)}-${formatTime(endHour, endMinutes)}`;
}

export const StartTimeEntry = <TFormData extends FieldValues>({
  index,
  namePrefix,
  setValue,
  watch,
  onRemove,
  className,
  showRemove = true,
  duration = 2, // Default duration for preview
  formatTimeSlot = defaultFormatTimeSlot,
}: StartTimeEntryProps<TFormData>) => {
  const t = useTranslations("form");
  // Watch current values (only hour and minutes now)
  const hour = watch(`${namePrefix}.${index}.hour` as FieldPath<TFormData>) || 0;
  const minutes = watch(`${namePrefix}.${index}.minutes` as FieldPath<TFormData>) || 0;
  
  // Generate preview using external formatting function
  const preview = formatTimeSlot(hour, minutes, duration);
  
  const handleHourChange = (newHour: number) => {
    setValue(`${namePrefix}.${index}.hour` as FieldPath<TFormData>, newHour as any);
  };
  
  const handleMinutesChange = (newMinutes: number) => {
    setValue(`${namePrefix}.${index}.minutes` as FieldPath<TFormData>, newMinutes as any);
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
      
      {/* Time inputs row - only hour and minutes */}
      <div className="space-y-4">
        {/* Hour dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-700">
            {t('hour')}
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
        
        {/* Minutes toggle - 4 buttons in a grid */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-700">
            {t('minutes')}
          </Label>
          <div className="grid grid-cols-4 gap-1 rounded-md border border-gray-300 bg-background p-1">
            {minuteOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleMinutesChange(option.value)}
                className={cn(
                  "px-2 py-2 text-sm font-medium transition-colors rounded-sm",
                  minutes === option.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

StartTimeEntry.displayName = "StartTimeEntry";