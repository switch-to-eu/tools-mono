"use client";

import React from "react";
import type {
  UseFormSetValue,
  UseFormWatch,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { TimeBlockSelector } from "./time-block-selector";
import { cn } from "@workspace/ui/lib/utils";

interface TimeSlotsManagerProps<TFormData extends FieldValues> {
  name: FieldPath<TFormData>;
  setValue: UseFormSetValue<TFormData>;
  watch: UseFormWatch<TFormData>;
  error?: FieldError;
  className?: string;
  label?: string;
  description?: string;
}

export const TimeSlotsManager = <TFormData extends FieldValues>({
  setValue,
  watch,
  error,
  className,
  label,
  description,
}: TimeSlotsManagerProps<TFormData>) => {
  // Watch current values - expecting selectedStartTimes and fixedDuration
  const selectedStartTimes = watch("selectedStartTimes" as FieldPath<TFormData>) || [];
  const fixedDuration = watch("fixedDuration" as FieldPath<TFormData>) || 2;
  
  // Convert start times to string array for the selector
  const selectedTimes = React.useMemo(() => {
    return selectedStartTimes.map((time: any) => {
      if (typeof time === 'string') return time;
      if (time?.hour !== undefined && time?.minutes !== undefined) {
        return `${time.hour.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
      }
      return '';
    }).filter(Boolean);
  }, [selectedStartTimes]);

  const handleTimeToggle = (timeString: string) => {
    const [hour, minutes] = timeString.split(':').map(Number);
    const timeObj = { hour, minutes };
    
    // Check if time is already selected
    const isSelected = selectedTimes.includes(timeString);
    
    let updatedTimes;
    if (isSelected) {
      // Remove the time
      updatedTimes = selectedStartTimes.filter((time: any) => {
        const currentTimeString = typeof time === 'string' ? time : `${time.hour.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
        return currentTimeString !== timeString;
      });
    } else {
      // Add the time
      updatedTimes = [...selectedStartTimes, timeObj];
    }
    
    setValue("selectedStartTimes" as FieldPath<TFormData>, updatedTimes as TFormData[FieldPath<TFormData>]);
  };

  const handleDurationChange = (duration: number) => {
    setValue("fixedDuration" as FieldPath<TFormData>, duration as TFormData[FieldPath<TFormData>]);
  };

  const handleClearAll = () => {
    setValue("selectedStartTimes" as FieldPath<TFormData>, [] as TFormData[FieldPath<TFormData>]);
  };

  const handlePresetSelect = (times: string[], duration: number) => {
    // Set duration first
    setValue("fixedDuration" as FieldPath<TFormData>, duration as TFormData[FieldPath<TFormData>]);
    
    // Convert time strings to time objects
    const timeObjects = times.map(timeString => {
      const [hour, minutes] = timeString.split(':').map(Number);
      return { hour, minutes };
    });
    
    // Set all times at once
    setValue("selectedStartTimes" as FieldPath<TFormData>, timeObjects as TFormData[FieldPath<TFormData>]);
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {(label || description) && (
        <div className="space-y-2">
          {label && (
            <h3 className="text-lg font-medium text-neutral-900">
              {label}
            </h3>
          )}
          {description && (
            <p className="text-sm text-neutral-600">{description}</p>
          )}
        </div>
      )}
      
      {/* Time Block Selector */}
      <TimeBlockSelector
        selectedTimes={selectedTimes}
        duration={fixedDuration}
        onTimeToggle={handleTimeToggle}
        onDurationChange={handleDurationChange}
        onClearAll={handleClearAll}
        onPresetSelect={handlePresetSelect}
      />
      
      {/* Form validation error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700 font-medium">
            {error.message || "Please select at least one time slot"}
          </p>
        </div>
      )}
    </div>
  );
};

TimeSlotsManager.displayName = "TimeSlotsManager";