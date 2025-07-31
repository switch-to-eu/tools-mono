import React from "react";
import { useTranslations } from "next-intl";
import type {
  UseFormRegister,
  FieldError,
  FieldPath,
  FieldValues,
  UseFormWatch,
} from "react-hook-form";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";

interface TimeRangeSelectorProps<TFormData extends FieldValues> {
  startTimeField: FieldPath<TFormData>;
  durationField: FieldPath<TFormData>;
  register: UseFormRegister<TFormData>;
  watch: UseFormWatch<TFormData>;
  startTimeError?: FieldError;
  durationError?: FieldError;
  className?: string;
  calculateEndTime: (startTime: string, duration: number) => string;
  isValidTimeRange: (startTime: string, duration: number) => boolean;
}

// Generate time options for 24h format with 30min intervals
const generateTimeOptions = (): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({
        value: timeString,
        label: timeString,
      });
    }
  }
  
  return options;
};

// Duration options in hours
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


export const TimeRangeSelector = <TFormData extends FieldValues>({
  startTimeField,
  durationField,
  register,
  watch,
  startTimeError,
  durationError,
  className,
  calculateEndTime,
  isValidTimeRange,
}: TimeRangeSelectorProps<TFormData>) => {
  const t = useTranslations("form");
  
  const startTime = watch(startTimeField);
  const duration = watch(durationField);
  
  const timeOptions = generateTimeOptions();
  const endTime = startTime && duration ? calculateEndTime(startTime, duration) : "";
  const isValid = startTime && duration ? isValidTimeRange(startTime, duration) : true;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-4">
        {/* Start Time Selector */}
        <div className="space-y-2">
          <Label
            htmlFor="startTime"
            className="text-sm font-medium text-neutral-700"
          >
            {t('startTime')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          
          <select
            id="startTime"
            className={cn(
              "h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              startTimeError && "border-red-500",
            )}
            {...register(startTimeField)}
          >
            <option value="">{t('selectStartTime')}</option>
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {startTimeError && (
            <p className="text-sm text-red-500">
              {startTimeError.message || t('errors.invalidStartTime')}
            </p>
          )}
        </div>

        {/* Duration Selector */}
        <div className="space-y-2">
          <Label
            htmlFor="duration"
            className="text-sm font-medium text-neutral-700"
          >
            {t('duration')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          
          <select
            id="duration"
            className={cn(
              "h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              durationError && "border-red-500",
            )}
            {...register(durationField, { valueAsNumber: true })}
          >
            <option value="">{t('selectDuration')}</option>
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {durationError && (
            <p className="text-sm text-red-500">
              {durationError.message || t('errors.invalidDuration')}
            </p>
          )}
        </div>
      </div>

      {/* End Time Display */}
      {startTime && duration && (
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">
              {t('timeRange')}:
            </span>
            <span className={cn(
              "text-sm font-mono",
              isValid ? "text-green-600" : "text-red-600"
            )}>
              {startTime} - {endTime}
            </span>
          </div>
          
          {!isValid && (
            <p className="text-sm text-red-600 mt-1">
              {t('timeRangeExceeds')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

TimeRangeSelector.displayName = "TimeRangeSelector";