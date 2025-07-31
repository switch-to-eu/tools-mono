"use client";

import React from "react";
import type {
  FieldError,
  FieldPath,
  FieldValues,
  Control
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";

interface TimeSelectionToggleProps<TFormData extends FieldValues> {
  name: FieldPath<TFormData>;
  control: Control<TFormData>;
  error?: FieldError;
  className?: string;
  disabled?: boolean;
  description?: string;
}

export const TimeSelectionToggle = <TFormData extends FieldValues>({
  name,
  control,
  error,
  className,
  disabled = false,
  description,
}: TimeSelectionToggleProps<TFormData>) => {
  const toggleId = `${String(name)}-toggle`;

  return (
    <div className={cn("space-y-3", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 border-gray-200">
            <div className="flex items-center gap-4">
              <span className={cn(
                "text-sm font-medium transition-colors",
                !field.value ? "text-gray-900" : "text-gray-500"
              )}>
                All Day
              </span>
              
              <Switch
                id={toggleId}
                checked={field.value || false}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className={cn(error && "ring-2 ring-red-500")}
              />
              
              <span className={cn(
                "text-sm font-medium transition-colors",
                field.value ? "text-gray-900" : "text-gray-500"
              )}>
                Time Slots
              </span>
            </div>
            
            {description && (
              <p className="text-sm text-gray-600 ml-4">
                {description}
              </p>
            )}
          </div>
        )}
      />

      {error?.message && (
        <p className="text-sm text-red-500 mt-2">
          {error.message}
        </p>
      )}
    </div>
  );
};

TimeSelectionToggle.displayName = "TimeSelectionToggle";