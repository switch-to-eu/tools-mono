"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { api } from "@/lib/trpc-client";
import { Link } from "../../../i18n/navigation";

export default function ItemsPage() {
    const t = useTranslations("items");

    const { data: items, isLoading, refetch } = api.example.getAll.useQuery();

    const deleteItem = api.example.delete.useMutation({
        onSuccess: () => {
            toast.success("Item deleted successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete item");
        },
    });

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this item?")) {
            deleteItem.mutate({ id });
        }
    };

    if (isLoading) {
        return (
            <main className="container mx-auto py-12">
                <div className="text-center">
                    <p className="text-gray-600">{t("loading")}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto py-12">
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

            {!items || items.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t("empty")}</p>
                    <Link href="/create" className="mt-4 inline-block">
                        <Button>Create your first item</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Card key={item.id} className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">
                                    {item.name}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            {item.description && (
                                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                            )}
                            <div className="text-xs text-gray-500">
                                Created: {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
} 