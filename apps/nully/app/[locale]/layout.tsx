import "./styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { MonitorDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import { Header } from "@workspace/ui/blocks/header";
import { routing } from "../../i18n/routing";
import { Link } from "../../i18n/navigation";
import { LanguageSelector } from "@components/language-selector";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    icons: [
      { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
      { rel: "shortcut icon", url: "/favicon.ico" },
      { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    manifest: "/site.webmanifest",
    appleWebApp: {
      title: t("title"),
    },
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function LocaleLayout({
  children,
  params,
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
          <div className="min-h-screen bg-gray-50">
            <Header
              logo={
                <Link href="/">
                  <div className="flex items-center gap-2 text-lg font-black transition-opacity hover:opacity-80 sm:text-xl">
                    <MonitorDown className="h-4 w-4 text-blue-600" />
                    <span className="tracking-wide uppercase text-blue-600">
                      Nully
                    </span>
                  </div>
                </Link>
              }
              navigation={
                <div className="flex items-center gap-2">
                  <LanguageSelector locale={locale} />
                </div>
              }
              mobileNavigation={
                <LanguageSelector locale={locale} />
              }
            />
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}