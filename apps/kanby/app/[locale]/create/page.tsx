"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { api } from "@/lib/trpc-client";
import { Link } from "../../../i18n/navigation";
import { FormTextArea } from "@workspace/ui/form/form-textarea";

const createItemSchema = z.object({
    name: z.string().min(1, "Name is required").max(256, "Name is too long"),
    description: z.string().optional(),
});

type CreateItemForm = z.infer<typeof createItemSchema>;

export default function CreatePage() {
    const t = useTranslations("create");
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateItemForm>({
        resolver: zodResolver(createItemSchema),
    });

    const createItem = api.example.create.useMutation({
        onSuccess: () => {
            toast.success(t("success"));
            reset();
            router.push("/");
        },
        onError: (error) => {
            toast.error(error.message || t("error"));
            setIsSubmitting(false);
        },
    });

    async function onSubmit(data: CreateItemForm) {
        setIsSubmitting(true);
        createItem.mutate(data);
    }

    return (
        <main className="container mx-auto py-12 max-w-2xl">
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label htmlFor="name">{t("form.name")}</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Enter item name"
                            className="mt-1"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">{t("form.description")}</Label>
                        <FormTextArea
                            label={t("form.description")}
                            name="description"
                            register={register}
                            placeholder="Enter item description (optional)"
                            className="mt-1"
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {isSubmitting ? "Creating..." : t("form.submit")}
                        </Button>
                        <Link href="/">
                            <Button type="button" variant="outline">
                                {t("form.cancel")}
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </main>
    );
} 