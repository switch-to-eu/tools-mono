"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  Control,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { 
  generateAvailableStartTimes, 
  validateStartTimes, 
  TimeValidationStrategy 
} from "@workspace/ui/lib/time-utils";

interface StartTimesSelectorProps<TFormData extends FieldValues> {
  name: FieldPath<TFormData>;
  control: Control<TFormData>;
  error?: FieldError;
  className?: string;
  label?: string;
  description?: string;
  duration?: number; // For validation - prevent overlapping slots
  /** Time interval in minutes (default: 30) */
  intervalMinutes?: number;
  /** Validation strategy (default: 'overlaps') */
  validationStrategy?: TimeValidationStrategy;
  /** Custom time generator function */
  timeGenerator?: () => string[];
  /** Custom validation function */
  timeValidator?: (times: string[], duration: number) => boolean;
}

// Generate time options for display in grid
const generateTimeOptionsGrid = (availableTimes: string[]): { value: string; label: string; hour: number }[] => {
  return availableTimes.map(time => {
    const [hourStr] = time.split(':');
    const hour = parseInt(hourStr || '0', 10);
    return {
      value: time,
      label: time,
      hour,
    };
  });
};

export const StartTimesSelector = <TFormData extends FieldValues>({
  name,
  control,
  error,
  className,
  label,
  description,
  duration = 1,
  intervalMinutes = 30,
  validationStrategy = 'overlaps',
  timeGenerator,
  timeValidator,
}: StartTimesSelectorProps<TFormData>) => {
  const t = useTranslations("form");
  
  const selectorId = `${String(name)}-start-times`;
  const displayLabel = label || t("selectStartTimes");
  
  // Use custom generators/validators or defaults
  const availableTimes = timeGenerator ? timeGenerator() : generateAvailableStartTimes(intervalMinutes);
  const validateTimes = timeValidator ? timeValidator : 
    (times: string[], dur: number) => validateStartTimes(times, dur, validationStrategy);
  
  const timeOptions = generateTimeOptionsGrid(availableTimes);

  // Group times by hour for better grid layout
  const timesByHour = timeOptions.reduce((acc, time) => {
    if (!acc[time.hour]) {
      acc[time.hour] = [];
    }
    acc[time.hour]!.push(time);
    return acc;
  }, {} as Record<number, typeof timeOptions>);

  const hours = Object.keys(timesByHour).map(Number).sort((a, b) => a - b);

  return (
    <div className={cn("space-y-4", className)}>
      <Label
        htmlFor={selectorId}
        className="text-sm font-medium text-neutral-700"
      >
        {displayLabel}
      </Label>
      
      {description && (
        <p className="text-sm text-neutral-500">{description}</p>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedTimes = field.value || [];
          
          const handleTimeToggle = (timeValue: string) => {
            const newSelectedTimes = selectedTimes.includes(timeValue)
              ? selectedTimes.filter((t: string) => t !== timeValue)
              : [...selectedTimes, timeValue];
            
            field.onChange(newSelectedTimes);
          };

          // Check if a time would create overlap with existing selections
          const wouldCreateOverlap = (timeValue: string): boolean => {
            if (selectedTimes.includes(timeValue)) return false;
            const testTimes = [...selectedTimes, timeValue];
            return !validateTimes(testTimes, duration);
          };

          return (
            <div className="space-y-3">
              {/* Time Grid - 6 hours per row */}
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: Math.ceil(hours.length / 6) }).map((_, rowIndex) => {
                  const rowHours = hours.slice(rowIndex * 6, (rowIndex + 1) * 6);
                  
                  return (
                    <div key={rowIndex} className="space-y-2">
                      {/* Hour labels */}
                      <div className="grid grid-cols-6 gap-2 text-xs text-neutral-500 font-medium">
                        {rowHours.map(hour => (
                          <div key={hour} className="text-center">
                            {hour.toString().padStart(2, '0')}:xx
                          </div>
                        ))}
                      </div>
                      
                      {/* Time slots for each half hour */}
                      {[0, 30].map(minutes => (
                        <div key={minutes} className="grid grid-cols-6 gap-2">
                          {rowHours.map(hour => {
                            const timeValue = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            const isSelected = selectedTimes.includes(timeValue);
                            const isDisabled = wouldCreateOverlap(timeValue);
                            
                            return (
                              <div key={timeValue} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${selectorId}-${timeValue}`}
                                  checked={isSelected}
                                  disabled={isDisabled}
                                  onCheckedChange={() => !isDisabled && handleTimeToggle(timeValue)}
                                  className={cn(
                                    "h-4 w-4",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                  )}
                                />
                                <Label
                                  htmlFor={`${selectorId}-${timeValue}`}
                                  className={cn(
                                    "text-xs cursor-pointer select-none",
                                    isSelected && "font-semibold text-primary",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  :{minutes.toString().padStart(2, '0')}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Selected times summary */}
              {selectedTimes.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Selected start times ({selectedTimes.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTimes.sort().map((time: string) => (
                      <span
                        key={time}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
      
      {error && (
        <p className="text-sm text-red-500">
          {error.message || "Please select at least one start time"}
        </p>
      )}
    </div>
  );
};

StartTimesSelector.displayName = "StartTimesSelector";