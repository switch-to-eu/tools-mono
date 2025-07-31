import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { Check, Database, Globe, Layers, Palette, Zap } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Link } from "../../i18n/navigation";

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'homepage' });

    const features = [
        {
            icon: <Zap className="h-5 w-5" />,
            title: t('features.nextjs'),
            description: "Modern React framework with App Router",
        },
        {
            icon: <Database className="h-5 w-5" />,
            title: t('features.trpc'),
            description: "End-to-end typesafe APIs",
        },
        {
            icon: <Layers className="h-5 w-5" />,
            title: t('features.drizzle'),
            description: "TypeScript SQL ORM",
        },
        {
            icon: <Globe className="h-5 w-5" />,
            title: t('features.i18n'),
            description: "Internationalization ready",
        },
        {
            icon: <Palette className="h-5 w-5" />,
            title: t('features.ui'),
            description: "Beautiful accessible components",
        },
    ];

    return (
        <main className="container mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-4">
                    {t('title')}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    {t('subtitle')}
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/create">
                        <Button size="lg" className="gap-2">
                            <Check className="h-5 w-5" />
                            {t('createButton')}
                        </Button>
                    </Link>
                    <Link href="/items">
                        <Button size="lg" variant="outline" className="gap-2">
                            <Database className="h-5 w-5" />
                            View Items
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
                    {t('features.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="p-6 text-center">
                            <div className="flex justify-center mb-4 text-blue-600">
                                {feature.icon}
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-gray-900">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <p className="text-gray-500 text-sm">
                    Ready to start building? Check out the{" "}
                    <Link href="/create" className="text-blue-600 hover:text-blue-800">
                        create page
                    </Link>{" "}
                    to see the full stack in action.
                </p>
            </div>
        </main>
    );
} 