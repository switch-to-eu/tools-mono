"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Check, User } from "lucide-react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { LoadingButton } from "~/components/ui/loading-button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

// Validation schema
const availabilitySchema = z.object({
    name: z.string().min(1, "Name is required"),
    availability: z.record(z.boolean()),
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

interface AvailabilityFormProps {
    dates: string[];
    onSubmit: (data: { name: string; availability: Record<string, boolean> }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: {
        name?: string;
        availability?: Record<string, boolean>;
    };
    existingParticipants?: string[];
    isEditing?: boolean;
}

export function AvailabilityForm({
    dates,
    onSubmit,
    onCancel,
    isLoading = false,
    initialData,
    existingParticipants = [],
    isEditing = false,
}: AvailabilityFormProps) {
    const [availability, setAvailability] = useState<Record<string, boolean>>({});

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setError,
        clearErrors,
    } = useForm<AvailabilityFormData>({
        resolver: zodResolver(availabilitySchema),
        defaultValues: {
            name: initialData?.name ?? "",
            availability: initialData?.availability ?? {},
        },
    });

    const watchedName = watch("name");

    // Initialize availability state
    useEffect(() => {
        const initialAvailability: Record<string, boolean> = {};
        dates.forEach((date) => {
            initialAvailability[date] = initialData?.availability?.[date] ?? false;
        });
        setAvailability(initialAvailability);
    }, [dates, initialData]);

    // Validate name conflicts
    useEffect(() => {
        if (watchedName?.trim() && !isEditing) {
            const conflictingName = existingParticipants.find(
                (name) => name.toLowerCase() === watchedName.trim().toLowerCase()
            );

            if (conflictingName) {
                setError("name", {
                    type: "manual",
                    message: "This name is already taken by another participant",
                });
            } else {
                clearErrors("name");
            }
        }
    }, [watchedName, existingParticipants, isEditing, setError, clearErrors]);

    const toggleAvailability = (date: string) => {
        setAvailability((prev) => ({
            ...prev,
            [date]: !prev[date],
        }));
    };

    const handleFormSubmit = async (data: AvailabilityFormData) => {
        console.log("data", data);
        await onSubmit({
            name: data.name.trim(),
            availability,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                    Your Name
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    {...register("name")}
                    className="h-12"
                />
                {errors.name && (
                    <p className="text-sm">{errors.name.message}</p>
                )}
            </div>

            {/* Availability Selection */}
            <div className="space-y-4">
                <Label className="text-base font-medium">
                    Select your available dates
                </Label>
                <div className="space-y-3">
                    {dates.map((date) => {
                        const isSelected = availability[date];
                        return (
                            <button
                                key={date}
                                type="button"
                                onClick={() => toggleAvailability(date)}
                                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${isSelected ? "border-2" : "border"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                                    </div>
                                    {isSelected && <Check className="h-5 w-5" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <LoadingButton
                    type="submit"
                    className="h-12 flex-1"
                    loading={isLoading}
                    loadingText={isEditing ? "Updating..." : "Submitting..."}
                >
                    <User className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Availability" : "Submit Availability"}
                </LoadingButton>
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    disabled={isLoading}
                    className="h-12 px-6"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
} 