import React from "react";
import { useTranslations } from "next-intl";

import type {
  UseFormRegister,
  FieldError,
  FieldPath,
  FieldValues
} from "react-hook-form";

import type { z } from "zod";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { isFieldRequired } from "./form-utils";

interface FormInputProps<TFormData extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string;
  name: FieldPath<TFormData>;
  register: UseFormRegister<TFormData>;
  error?: FieldError;
  description?: string;
  valueAsNumber?: boolean;
  // Optional schema to auto-determine required status
  schema?: z.ZodObject<z.ZodRawShape>;
}

export const FormInput = <TFormData extends FieldValues>({
  label,
  name,
  register,
  error,
  description,
  className,
  id,
  valueAsNumber,
  schema,
  ...props
}: FormInputProps<TFormData>) => {
  const t = useTranslations("form");

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
          <span className="text-neutral-400 ml-1">{t('optional')}</span>
        )}
      </Label>

      {description && (
        <p className="text-sm text-neutral-500">{description}</p>
      )}

      <Input
        id={inputId}
        className={cn(
          "h-10 border-gray-300",
          error && "border-red-500",
          className
        )}
        {...register(name, { valueAsNumber })}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500">
          {t(`errors.${error.message}`) || t('errors.invalid')}
        </p>
      )}
    </div>
  );
};

FormInput.displayName = "FormInput";