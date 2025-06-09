import React from "react";

import type {
  UseFormRegister,
  FieldError,
  FieldPath,
  FieldValues
} from "react-hook-form";
import type { z } from "zod";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { isFieldRequired } from "./form-utils";

interface FormTextAreaProps<TFormData extends FieldValues>
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  label: string;
  name: FieldPath<TFormData>;
  register: UseFormRegister<TFormData>;
  error?: FieldError;
  description?: string;
  // Optional schema to auto-determine required status
  schema?: z.ZodObject<z.ZodRawShape>;
}

export const FormTextArea = <TFormData extends FieldValues>({
  label,
  name,
  register,
  error,
  description,
  className,
  id,
  rows = 4,
  schema,
  ...props
}: FormTextAreaProps<TFormData>) => {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");

  // Determine if field is required from schema if provided
  const isRequired = schema ? isFieldRequired(schema, String(name)) : false;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={inputId}
        className="text-sm font-medium text-neutral-700"
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
        {!isRequired && (
          <span className="text-neutral-400 ml-1">(Optional)</span>
        )}
      </Label>

      {description && (
        <p className="text-sm text-neutral-500">{description}</p>
      )}

      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          "min-h-[100px] w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:border-purple-400 focus-visible:ring-purple-100 focus-visible:ring-1",
          error && "border-red-500",
          className
        )}
        {...register(name)}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
};

FormTextArea.displayName = "FormTextArea";