import "./styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Calendar, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { TRPCReactProvider } from "@/lib/trpc-client";
import { Header } from "@workspace/ui/blocks/header";
import { Footer } from "@workspace/ui/blocks/footer";
import { Button } from "@workspace/ui/components/button";
import { BrandIndicator } from "@workspace/ui/components/brand-indicator";
import { hasLocale, Locale, NextIntlClientProvider } from "next-intl";
import { routing } from "i18n/routing";
import { notFound } from "next/navigation";
import { Link } from "@i18n/navigation";
import { LanguageSelector } from "@components/language-selector";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'layout.metadata' });

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
  params: Promise<{ locale: Locale }>;
}) {

  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'layout.header' });

  return (
    <html lang={locale} className={`${geist.variable}`}>
      <body>
        <NextIntlClientProvider>
          <TRPCReactProvider>
            <div className="min-h-screen bg-gray-50">
              <Header
                logo={
                  <Link href="/">
                    <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
                      <div className="flex items-center justify-center mt-1">
                        <Calendar className="h-4 w-4 text-primary-color" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-primary-color tracking-wide uppercase sm:text-xl leading-none">Plotty</span>
                        <BrandIndicator locale={locale} variant="compact" className="-mt-0.5" asSpan />
                      </div>
                    </div>
                  </Link>
                }
                navigation={
                  <div className="flex items-center gap-2">
                    <LanguageSelector locale={locale} />
                    <Link href="/about">
                      <Button variant="ghost" size="sm">
                        {t('about')}
                      </Button>
                    </Link>
                    <Link href="/create">
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('createPoll')}
                      </Button>
                    </Link>
                  </div>
                }
                mobileNavigation={
                  <Link href="/create">
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Link>
                }
              />
              {children}
              <Footer locale={locale} appName="Plotty" />
            </div>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
