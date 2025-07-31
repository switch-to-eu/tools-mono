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
  selectedTimesFieldName: FieldPath<TFormData>;
  durationFieldName: FieldPath<TFormData>;
}

export const TimeSlotsManager = <TFormData extends FieldValues>({
  setValue,
  watch,
  error,
  className,
  label,
  description,
  selectedTimesFieldName,
  durationFieldName,
}: TimeSlotsManagerProps<TFormData>) => {
  // Watch current values using provided field names
  const selectedStartTimes = watch(selectedTimesFieldName) || [];
  const fixedDuration = watch(durationFieldName) || 1;
  
  // Convert start times to string array for the selector
  const selectedTimes = React.useMemo(() => {
    if (!Array.isArray(selectedStartTimes)) return [];
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
    
    setValue(selectedTimesFieldName, updatedTimes as TFormData[FieldPath<TFormData>]);
  };

  const handleDurationChange = (duration: number) => {
    setValue(durationFieldName, duration as TFormData[FieldPath<TFormData>]);
  };

  const handleClearAll = () => {
    setValue(selectedTimesFieldName, [] as TFormData[FieldPath<TFormData>]);
  };

  const handlePresetSelect = (times: string[], duration: number) => {
    // Set duration first
    setValue(durationFieldName, duration as TFormData[FieldPath<TFormData>]);
    
    // Convert time strings to time objects
    const timeObjects = times.map(timeString => {
      const [hour, minutes] = timeString.split(':').map(Number);
      return { hour, minutes };
    });
    
    // Set all times at once
    setValue(selectedTimesFieldName, timeObjects as TFormData[FieldPath<TFormData>]);
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