# Creating New Apps in the Monorepo

This guide explains how to create a new Next.js application in this Turborepo monorepo.

## Overview

This monorepo uses:
- **Turborepo** for build orchestration and caching
- **pnpm** for package management with workspaces
- **Next.js** with App Router for applications
- **TypeScript** throughout
- **Shared packages** for UI components, tRPC setup, and configurations

## Quick Start

### Option 1: Automated Script (Recommended)

Use the automated script that copies the example app and updates all references:

```bash
# From monorepo root
pnpm create-app your-app-name

# Or run the script directly
./scripts/create-app.sh your-app-name

# Interactive mode (prompts for app name)
pnpm create-app
```

This script will:
- Copy all files from `apps/example`
- Replace all "example" references with your app name
- Update package.json name to `@workspace/your-app-name`
- Update database table prefixes (e.g., `example_` → `your_app_name_`)
- Generate a README for your new app
- Provide next steps for setup

### Option 2: Manual Setup

If you prefer to set up manually:

### 1. Create App Directory

```bash
# From monorepo root
mkdir apps/your-app-name
cd apps/your-app-name
```

### 2. Create package.json

```json
{
  "name": "@workspace/your-app-name",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "next build",
    "dev": "next dev --turbo",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.0.1",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@t3-oss/env-nextjs": "^0.12.0",
    "@tanstack/react-query": "^5.69.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@trpc/server": "^11.0.0",
    "@workspace/trpc": "workspace:*",
    "@workspace/ui": "workspace:*",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.41.0",
    "lucide-react": "^0.511.0",
    "nanoid": "^5.1.5",
    "next": "^15.2.3",
    "next-intl": "^4.1.0",
    "postgres": "^3.4.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.56.4",
    "server-only": "^0.0.1",
    "sonner": "^2.0.3",
    "superjson": "^2.2.1",
    "tailwind-merge": "^3.3.0",
    "zod": "^3.25.36"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@tailwindcss/postcss": "^4.0.15",
    "@types/node": "^20.14.10",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@workspace/eslint-config": "workspace:*",
    "@workspace/typescript-config": "workspace:*",
    "drizzle-kit": "^0.30.6",
    "eslint": "^9.23.0",
    "eslint-config-next": "^15.3.3",
    "eslint-plugin-drizzle": "^0.2.3",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "tailwindcss": "^4.0.15",
    "tw-animate-css": "^1.3.1",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.27.0"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "extends": "@workspace/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@workspace/ui/*": [
        "../../packages/ui/src/*"
      ],
      "@/lib/*": [
        "./lib/*"
      ],
      "@/server/*": [
        "./server/*"
      ],
      "@components/*": [
        "./components/*"
      ],
      "@hooks/*": [
        "./hooks/*"
      ],
      "@i18n/*": [
        "./i18n/*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "next.config.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 4. Create next.config.mjs

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/trpc"],
}

export default withNextIntl(nextConfig);
```

### 5. Create eslint.config.js

```javascript
import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linting.Config} */
export default nextJsConfig
```

### 6. Create postcss.config.mjs

```javascript
export default {};
```

## Directory Structure

Create the following directory structure:

```
apps/your-app-name/
├── app/
│   └── [locale]/              # Internationalized routes
│       ├── layout.tsx         # Root layout
│       ├── page.tsx          # Home page
│       ├── styles/
│       │   └── globals.css   # Global styles
│       └── api/
│           └── trpc/
│               └── [trpc]/
│                   └── route.ts
├── components/               # App-specific components
├── lib/                     # Utilities and tRPC client
│   └── trpc-client.tsx
├── server/                  # Server-side code
│   ├── api/
│   │   ├── root.ts         # tRPC root router
│   │   ├── trpc.ts         # tRPC setup
│   │   ├── trpc-server.ts  # Server setup
│   │   └── routers/        # API routers
├── i18n/                   # Internationalization setup
│   ├── navigation.ts
│   ├── request.ts
│   └── routing.ts
├── messages/               # Translation files
│   ├── en.json
│   └── nl.json
├── hooks/                  # Custom React hooks
├── drizzle.config.ts      # Database configuration
├── middleware.ts          # Next.js middleware
├── global.ts             # Global type definitions
├── next-env.d.ts
├── components.json       # shadcn/ui configuration
└── Configuration files...
```

## Key Files Setup

### App Layout (app/[locale]/layout.tsx)

```tsx
import "./styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import { TRPCReactProvider } from "@/lib/trpc-client";
import { Header } from "@workspace/ui/blocks/header";
import { routing } from "../../i18n/routing";

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

  return (
    <html lang={locale} className={`${geist.variable}`}>
      <body>
        <NextIntlClientProvider>
          <TRPCReactProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              {children}
            </div>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Global Styles (app/[locale]/styles/globals.css)

```css
@import "@workspace/ui/styles/globals.css";
```

### tRPC Client (lib/trpc-client.tsx)

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import superjson from "superjson";

import { type AppRouter } from "@/server/api/root";

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: superjson,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
```

### Database Configuration (drizzle.config.ts)

```typescript
import { type Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["your-app-name_*"],
} satisfies Config;
```

## Database Setup

### Schema (server/db/schema.ts)

```typescript
import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `your-app-name_${name}`);

export const items = createTable(
  "item",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  })
);
```

### Database Connection (server/db/index.ts)

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

## tRPC Setup

### Root Router (server/api/root.ts)

```typescript
import { createCallerFactory, createTRPCRouter } from "@workspace/trpc";
import { exampleRouter } from "./routers/example";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
```

### Example Router (server/api/routers/example.ts)

```typescript
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@workspace/trpc";
import { db } from "@/server/db";
import { items } from "@/server/db/schema";

export const exampleRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [item] = await db.insert(items).values({
        name: input.name,
      }).returning();
      return item;
    }),

  getAll: publicProcedure.query(async () => {
    return await db.select().from(items);
  }),
});
```

## Internationalization Setup

### Routing (i18n/routing.ts)

```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'nl'],
  defaultLocale: 'en'
});

export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

### Request Configuration (i18n/request.ts)

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

### Navigation (i18n/navigation.ts)

```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

## Components Configuration (components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "../../packages/ui/tailwind.config.ts",
    "css": "app/[locale]/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils"
  }
}
```

## Running Your New App

1. **Install dependencies** (from monorepo root):
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   # Create .env.local in your app directory
   DATABASE_URL="postgresql://..."
   ```

3. **Generate database schema**:
   ```bash
   pnpm --filter=@workspace/your-app-name db:push
   ```

4. **Start development**:
   ```bash
   # From monorepo root - runs all apps
   pnpm dev

   # Or run specific app
   pnpm --filter=@workspace/your-app-name dev
   ```

## Available Scripts

From the monorepo root, you can run:

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages

For specific apps:
- `pnpm --filter=@workspace/your-app-name dev`
- `pnpm --filter=@workspace/your-app-name build`
- `pnpm --filter=@workspace/your-app-name lint`

## Using Shared Packages

### UI Components

```tsx
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Header } from "@workspace/ui/blocks/header";

export default function MyPage() {
  return (
    <div>
      <Header />
      <Card>
        <Button>Click me</Button>
      </Card>
    </div>
  );
}
```

### tRPC

```tsx
import { api } from "@/lib/trpc-client";

export default function MyComponent() {
  const { data, isLoading } = api.example.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Script Requirements

The automated script requires:
- `rsync` for copying files (usually pre-installed on Linux/macOS)
- `sed` for text replacement (usually pre-installed)
- `bash` shell

### App Name Validation

The script validates app names to ensure they:
- Start with a lowercase letter
- Contain only lowercase letters, numbers, and hyphens
- End with a letter or number
- Examples of valid names: `my-app`, `dashboard`, `user-portal`

## Tips

1. **Use the automated script**: Much faster and ensures consistency
2. **Use workspace dependencies**: Always use `workspace:*` for internal packages
3. **Follow naming conventions**: Use `@workspace/app-name` format
4. **Database table prefixes**: The script automatically handles prefixing (e.g., `my_app_users`)
5. **Environment variables**: Each app can have its own `.env.local`
6. **Shared components**: Put reusable components in `packages/ui/`

## Troubleshooting

### Common Issues

1. **Build errors**: Make sure `transpilePackages` includes workspace packages
2. **Type errors**: Check TypeScript path mappings in `tsconfig.json`
3. **Import errors**: Verify workspace dependencies in `package.json`
4. **Database issues**: Ensure unique table prefixes for each app

### Getting Help

- Check existing apps (`apps/example`, `apps/plotty`) for reference
- Verify workspace configuration in `pnpm-workspace.yaml`
- Check Turborepo configuration in `turbo.json`