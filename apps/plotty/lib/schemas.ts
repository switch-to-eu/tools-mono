import { z } from "zod";

export const pollSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),

    description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional()
        .or(z.literal("")),

    location: z
        .string()
        .max(100, "Location must be less than 100 characters")
        .optional()
        .or(z.literal("")),

    selectedDates: z
        .array(z.date())
        .min(1, "At least one date is required")
        .refine(
            (dates) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day for comparison
                return dates.every((date) => {
                    const dateToCheck = new Date(date);
                    dateToCheck.setHours(0, 0, 0, 0);
                    return dateToCheck >= today;
                });
            },
            "All selected dates must be today or in the future",
        ),

    expirationDays: z
        .number()
        .min(1, "Expiration must be at least 1 day")
        .max(365, "Expiration cannot exceed 365 days"),
});

export type PollFormData = z.infer<typeof pollSchema>;
