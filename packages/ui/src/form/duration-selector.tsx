"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  UseFormRegister,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";

interface DurationSelectorProps<TFormData extends FieldValues> {
  name: FieldPath<TFormData>;
  register: UseFormRegister<TFormData>;
  error?: FieldError;
  className?: string;
  label?: string;
  description?: string;
}

// Duration options in hours (1h-8h)
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

export const DurationSelector = <TFormData extends FieldValues>({
  name,
  register,
  error,
  className,
  label,
  description,
}: DurationSelectorProps<TFormData>) => {
  const t = useTranslations("form");
  
  const selectorId = `${String(name)}-duration`;
  const displayLabel = label || t("fixedDuration");

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={selectorId}
        className="text-sm font-medium text-neutral-700"
      >
        {displayLabel}
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      {description && (
        <p className="text-sm text-neutral-500">{description}</p>
      )}
      
      <select
        id={selectorId}
        className={cn(
          "h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500",
        )}
        {...register(name, { valueAsNumber: true })}
      >
        <option value="">Select duration</option>
        {durationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-500">
          {error.message || "Please select a duration"}
        </p>
      )}
    </div>
  );
};

DurationSelector.displayName = "DurationSelector";