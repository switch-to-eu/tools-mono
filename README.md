# Tools Monorepo

A Turborepo monorepo template with Next.js apps and shared packages, featuring shadcn/ui, tRPC, and Drizzle ORM.

## Quick Start

### Creating a New App

Use the automated script to create a new app based on the example template:

```bash
# Create a new app interactively
pnpm create-app

# Or specify the app name directly
pnpm create-app my-awesome-app
```

This will:
- Copy the example app structure
- Update all references to your app name
- Set up database table prefixes
- Generate a README with setup instructions

### Development

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# run a single app in development mode
capp-name

# Build all apps and packages
pnpm build

# Lint all packages
pnpm lint
```

## Project Structure

```
apps/
├── example/          # Example Next.js app with full features
├── plotty/           # Polling app example
└── your-new-app/     # Your apps created with the script

packages/
├── ui/               # Shared UI components (shadcn/ui)
├── trpc/             # Shared tRPC configuration
├── eslint-config/    # Shared ESLint configurations
└── typescript-config/ # Shared TypeScript configurations
```

## Adding UI Components

To add shadcn/ui components to your app:

```bash
pnpm dlx shadcn@latest add button -c apps/your-app-name
```

This will place the UI components in the `packages/ui/src/components` directory.

## Using Shared Components

Import components from the shared UI package:

```tsx
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Header } from "@workspace/ui/blocks/header"
```

## Documentation

- [Creating New Apps Guide](docs/creating-new-apps.md) - Comprehensive guide for creating new applications
- [Turborepo Docs](https://turbo.build/repo/docs) - Official Turborepo documentation
