"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  UseFormRegister,
  FieldError,
  FieldPath,
  FieldValues,
  Control
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
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
  const t = useTranslations("form");

  const toggleId = `${String(name)}-toggle`;

  return (
    <div className={cn("space-y-3", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={cn(
            "border rounded-lg p-4 transition-colors",
            field.value ? "bg-blue-50 border-blue-200" : "bg-neutral-50 border-neutral-200"
          )}>
            <div className="flex items-start space-x-3">
              <Checkbox
                id={toggleId}
                checked={field.value || false}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className={cn(
                  error && "border-red-500",
                  "h-5 w-5 mt-0.5"
                )}
              />
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor={toggleId}
                  className={cn(
                    "text-sm font-medium cursor-pointer block",
                    disabled && "cursor-not-allowed opacity-50",
                    field.value ? "text-blue-900" : "text-neutral-700"
                  )}
                >
                  {t("enableSpecificTimes")}
                </Label>
                <p className={cn(
                  "text-sm",
                  field.value ? "text-blue-700" : "text-neutral-500"
                )}>
                  {description || "Choose specific time ranges instead of all-day events"}
                </p>
                {field.value && (
                  <div className="bg-blue-100 border border-blue-200 rounded-md p-2 text-xs text-blue-800">
                    ✨ <strong>Time selection enabled!</strong> You can now pick specific hours when your event can happen.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      />

      {error?.message && (
        <p className="text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
};

TimeSelectionToggle.displayName = "TimeSelectionToggle";