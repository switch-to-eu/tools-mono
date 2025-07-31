"use client";

import React from "react";
import { Plus } from "lucide-react";
import type {
  UseFormSetValue,
  UseFormWatch,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { StartTimeEntry } from "./start-time-entry";
import { cn } from "@workspace/ui/lib/utils";

interface StartTime {
  hour: number;
  minutes: number;
}

interface StartTimesManagerProps<TFormData extends FieldValues> {
  name: FieldPath<TFormData>;
  setValue: UseFormSetValue<TFormData>;
  watch: UseFormWatch<TFormData>;
  error?: FieldError;
  className?: string;
  label?: string;
  description?: string;
  maxSlots?: number;
  duration?: number; // External duration for validation and preview
  formatTimeSlot?: (hour: number, minutes: number, duration: number) => string;
}

// Check for duplicate start times (same hour:minute combination)
function hasDuplicateStartTimes(slots: StartTime[]): boolean {
  if (slots.length <= 1) return false;
  
  const timeStrings = slots.map((slot) => {
    if (!slot || typeof slot.hour !== 'number' || typeof slot.minutes !== 'number') {
      return "0:0";
    }
    return `${slot.hour}:${slot.minutes}`;
  });
  
  // Check if any time string appears more than once
  const uniqueTimes = new Set(timeStrings);
  return uniqueTimes.size !== timeStrings.length;
}

export const StartTimesManager = <TFormData extends FieldValues>({
  name,
  setValue,
  watch,
  error,
  className,
  label,
  description,
  maxSlots = 10,
  duration = 2, // Default duration for validation and preview
  formatTimeSlot,
}: StartTimesManagerProps<TFormData>) => {
  // Watch current start times
  const startTimes = watch(name) || [];
  
  const displayLabel = label || "Start times";
  
  // Add new start time
  const addStartTime = () => {
    if ((startTimes?.length || 0) >= maxSlots) return;
    
    const newStartTime: StartTime = {
      hour: 9, // Default to 9 AM
      minutes: 0,
    };
    
    const currentTimes: StartTime[] = Array.isArray(startTimes) ? startTimes : [];
    const updatedStartTimes: StartTime[] = [...currentTimes, newStartTime];
    setValue(name, updatedStartTimes as TFormData[typeof name]);
  };
  
  // Remove start time
  const removeStartTime = (index: number) => {
    const currentTimes: StartTime[] = Array.isArray(startTimes) ? startTimes : [];
    const updatedStartTimes: StartTime[] = currentTimes.filter((_, i: number) => i !== index);
    setValue(name, updatedStartTimes as TFormData[typeof name]);
  };
  
  // Validation checks - only check for duplicates now
  const hasDuplicates = hasDuplicateStartTimes(startTimes || []);
  const hasValidationErrors = hasDuplicates;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neutral-700">
          {displayLabel}
          {startTimes && startTimes.length > 0 && (
            <span className="ml-2 text-xs text-neutral-500">
              ({startTimes.length} {startTimes.length === 1 ? "time" : "times"})
            </span>
          )}
        </Label>
        
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
      </div>
      
      {/* Start time entries */}
      <div className="space-y-3">
        {(!startTimes || startTimes.length === 0) ? (
          /* Empty state */
          <div className="text-center py-8 text-neutral-500">
            <p className="text-sm">No start times added yet</p>
            <p className="text-xs mt-1">
              Click '+ Add Time' to create your first start time
            </p>
          </div>
        ) : (
          /* Start time list */
          startTimes?.map((_: any, index: number) => (
            <StartTimeEntry
              key={index}
              index={index}
              namePrefix={name}
              setValue={setValue}
              watch={watch}
              onRemove={() => removeStartTime(index)}
              showRemove={(startTimes?.length || 0) > 1}
              duration={duration} // Pass external duration for preview
              formatTimeSlot={formatTimeSlot}
            />
          ))
        )}
      </div>
      
      {/* Add time button */}
      <Button
        type="button"
        variant="outline"
        onClick={addStartTime}
        disabled={(startTimes?.length || 0) >= maxSlots}
        className="w-full"
      >
        <Plus className="h-4 w-4" />
        Add Time
      </Button>
      
      {/* Validation errors */}
      {hasValidationErrors && (
        <div className="space-y-1">
          {hasDuplicates && (
            <p className="text-sm text-red-500">
              Start times cannot be duplicated - each time must be unique
            </p>
          )}
        </div>
      )}
      
      {/* Form validation error */}
      {error && (
        <p className="text-sm text-red-500">
          {error.message || "Please check your start times"}
        </p>
      )}
      
      {/* Max slots warning */}
      {(startTimes?.length || 0) >= maxSlots && (
        <p className="text-sm text-amber-600">
          Maximum of {maxSlots} start times allowed
        </p>
      )}
    </div>
  );
};

StartTimesManager.displayName = "StartTimesManager";