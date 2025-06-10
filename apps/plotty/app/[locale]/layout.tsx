import "./styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Calendar, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { TRPCReactProvider } from "@/lib/trpc-client";
import { Header } from "@workspace/ui/blocks/header";
import { Button } from "@workspace/ui/components/button";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "i18n/routing";
import { notFound } from "next/navigation";
import { Link } from "@i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Layout.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    icons: [
      { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
      { rel: "shortcut icon", url: "/favicon.ico" },
      { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    manifest: "/site.webmanifest",
    appleWebApp: {
      title: t('title'),
    },
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Layout.header' });

  return (
    <html lang={locale} className={`${geist.variable}`}>
      <body>
        <NextIntlClientProvider>
          <TRPCReactProvider>
            <div className="min-h-screen bg-gray-50">
              <Header
                logo={
                  <Link href="/">
                    <div className="flex items-center gap-2 text-lg font-black transition-opacity hover:opacity-80 sm:text-xl">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-purple-600 tracking-wide uppercase">Plotty</span>
                    </div>
                  </Link>
                }
                navigation={
                  <Link href="/create">
                    <Button variant="default" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('createPoll')}
                    </Button>
                  </Link>
                }
                mobileNavigation={
                  <Link href="/create">
                    <Button size="sm" variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Link>
                }
              />
              {children}
            </div>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
