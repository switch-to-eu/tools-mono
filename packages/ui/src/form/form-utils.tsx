import type { z } from "zod";

// Utility to check if a field is required in a Zod schema
export function isFieldRequired<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    fieldName: keyof T,
): boolean {
    try {
        const shape = schema.shape;
        const fieldSchema = shape[fieldName];

        if (!fieldSchema) return false;

        // Test with undefined to see if it passes validation
        const result = fieldSchema.safeParse(undefined);
        return !result.success;
    } catch {
        return false;
    }
}
