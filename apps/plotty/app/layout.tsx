import "./styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/lib/trpc-client";
import { Header } from "@workspace/ui/blocks/header";

export const metadata: Metadata = {
  title: "Plotty",
  description: "Schedule Meetings without hassle",
  icons: [
    { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
  ],
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Plotty",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            {children}
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
