# Development Guidelines for Tools Monorepo

This document combines architectural rules and technical guidelines for the tools monorepo project.

## Monorepo Separation of Concerns - Architectural Rules

**Last Updated**: 2025-01-21
**Context**: Learned during KeepFocus Pomodoro Integration implementation
**Mistake Made**: Initially placed app-specific components in shared packages/ui/blocks/ - WRONG!

### 🏗️ **Core Principle**

**Shared packages contain GENERIC, reusable code. App-specific packages contain BUSINESS DOMAIN logic.**

### 📂 **What Goes Where - Detailed Breakdown**

#### **`packages/ui/` - Generic UI Components Only**

##### ✅ **Should Contain:**
- **Generic UI primitives**: `Button`, `Input`, `Card`, `Progress`, `Switch`
- **Generic layout blocks**: `SectionCard`, `Header`, `Calendar` (reusable across apps)
- **Generic form components**: `FormInput`, `FormTextArea` (with i18n support)
- **Generic hooks**: UI-related hooks that work across domains
- **Generic utilities**: `cn()`, color helpers, generic formatters
- **Generic types**: Component prop interfaces, UI state types

##### ❌ **Should NOT Contain:**
- **Business domain types**: `Task`, `Poll`, `User`, `PomodoroSettings`
- **Domain-specific hooks**: `useSettings`, `useTasks`, `usePolls`
- **Business logic**: Validation rules, calculation logic
- **App-specific components**: Components tied to specific business domains
- **🚨 CRITICAL**: If a component has props like `pomodoros`, `activeTask`, `settings` → **IT'S APP-SPECIFIC!**

#### **`apps/{app}/lib/` - Business Domain Logic**

##### ✅ **Should Contain:**
- **Domain types & interfaces**: `Task`, `PomodoroSettings`, `Poll`, `Participant`
- **Business schemas**: Zod schemas for domain validation
- **Domain utilities**: Business-specific calculations, formatters
- **Domain constants**: App-specific constants, enums, defaults
- **Business logic**: Core business rules and operations

**Examples from existing apps:**
- `apps/plotty/lib/interfaces.ts` - Poll domain types
- `apps/plotty/lib/schemas.ts` - Poll validation schemas
- `apps/plotty/lib/crypto.ts` - Poll-specific encryption logic

#### **`apps/{app}/hooks/` - App-Specific Hooks**

##### ✅ **Should Contain:**
- **Domain hooks**: `useSettings`, `useTasks`, `usePolls`
- **Business logic hooks**: `useDeletePoll`, `useLoadPoll`, `useVote`
- **State management**: App-specific state management hooks
- **Side effects**: App-specific side effects (localStorage, notifications)

#### **`apps/{app}/components/` - App-Specific Components**

##### ✅ **Should Contain:**
- **Domain components**: Components that understand business concepts
- **Page components**: Components specific to app pages/routes
- **Feature components**: Components tied to specific app features

### 🔄 **Component Import Patterns**

#### **Direct File Imports (Current Pattern)**
```tsx
// ✅ Correct - Direct imports from individual files
import { Button } from "@workspace/ui/components/button";
import { SectionCard } from "@workspace/ui/blocks/section-card";
import { FormInput } from "@workspace/ui/form/form-input";

// ❌ Wrong - No index.ts files used
import { Button } from "@workspace/ui/components";
```

#### **Package.json Exports Handle Path Mapping**
```json
{
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./blocks/*": "./src/blocks/*.tsx",
    "./form/*": "./src/form/*.tsx"
  }
}
```

### 🚨 **Common Mistakes to Avoid**

#### **❌ Mistake: "This component looks reusable, so it goes in shared packages"**

**Example mistake we made:**
- Created `task-item.tsx` with props: `pomodoros`, `isActive`, `onSetActive`
- **WRONG THINKING**: "It's just displaying a task, seems generic"
- **REALITY**: It has pomodoro-specific props and behavior → **APP-SPECIFIC**

#### **✅ Correct Decision Process:**

1. **Does it have domain-specific props?** (`task`, `poll`, `pomodoros`, `settings`) → **APP-SPECIFIC**
2. **Does it know business concepts?** (what a "pomodoro" is, timer phases, etc.) → **APP-SPECIFIC**
3. **Would other apps use it as-is?** (without changing props/logic) → If NO: **APP-SPECIFIC**

### 📋 **Decision Matrix**

When deciding where to put code, ask:

| **Question** | **If YES → `packages/ui/`** | **If NO → `apps/{app}/`** |
|--------------|----------------------------|---------------------------|
| Can this be used by other apps **AS-IS**? | Generic UI component | App-specific component |
| Is this pure UI presentation **without domain knowledge**? | Button, Input, Card | PollForm, TaskItem |
| Does it contain business logic? | No business logic | Business domain logic |
| Does it know about domain concepts? | No domain knowledge | Knows Tasks, Polls, etc. |
| **🚨 Does it have domain-specific props?** | **Generic props only** | **Domain props = APP-SPECIFIC** |

### 🎯 **Key Takeaway**

**Shared packages are for INFRASTRUCTURE. App packages are for BUSINESS LOGIC.**

The moment you introduce business domain concepts (Tasks, Polls, Users, Settings), it belongs in the app, not the shared package.

## Tech Stack and Development Guidelines

### Turborepo Structure

This project follows a monorepo structure managed by Turborepo with the following organization:

#### Root Level
- `apps/` - Next.js applications and other standalone apps
- `packages/` - Shared packages and libraries
- `turbo.json` - Turborepo configuration
- `pnpm-workspace.yaml` - Package manager workspace configuration

#### Applications (`apps/`)
- Each app in `apps/` is a standalone Next.js application
- Apps can consume packages from `packages/`
- Use App Router and modern Next.js patterns
- Each app should have its own `package.json` and dependencies

#### Shared Packages (`packages/`)

##### `packages/ui/` - UI Component Library
- **Location for all reusable UI components**
- Structure:
  - `src/components/` - Base UI components (buttons, inputs, modals, etc.)
  - `src/blocks/` - Composite components and page sections
  - `src/form/` - Form-specific components and validation
  - `src/hooks/` - Shared React hooks
  - `src/lib/` - Utility functions and helpers
  - `src/styles/` - Global styles and Tailwind configuration
- Export components with named exports
- Include proper TypeScript interfaces for all props
- Use Radix UI primitives as building blocks
- Implement variants using class-variance-authority (CVA)

##### `packages/trpc/` - API Layer
- tRPC router definitions
- API types and schemas
- Server-side logic that can be shared across apps

##### `packages/eslint-config/` - Linting Configuration
- Shared ESLint rules across the monorepo
- Extend this in individual apps and packages

##### `packages/typescript-config/` - TypeScript Configuration
- Base TypeScript configurations
- Different configs for apps, packages, and specific use cases

### Where to Put Different Types of Code

#### UI Components
- **Base components** (Button, Input, Card): `packages/ui/src/components/`
- **Complex blocks** (Navigation, Hero sections): `packages/ui/src/blocks/`
- **Form components**: `packages/ui/src/form/`
- **App-specific components**: Within the respective app's `components/` directory

#### Business Logic
- **Shared API logic**: `packages/trpc/`
- **App-specific logic**: Within the app's `lib/` or `utils/` directory
- **Database schemas**: Dedicated database package (if separate from trpc)

#### Styles and Theming
- **Global styles**: `packages/ui/src/styles/`
- **Component-specific styles**: Co-located with components using Tailwind classes
- **Tailwind config**: Shared in `packages/ui/`

#### Utilities and Helpers
- **UI-related utilities**: `packages/ui/src/lib/`
- **API utilities**: `packages/trpc/src/lib/`
- **App-specific utilities**: Within the app's `lib/` directory

#### Types and Schemas
- **API types**: `packages/trpc/`
- **UI component types**: Co-located with components in `packages/ui/`
- **App-specific types**: Within the app's `types/` directory
- **Database types**: Generated by Drizzle ORM

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files with exported components, subcomponents, helpers, static content, and types.
- Favor named exports for components and functions.
- Use lowercase with dashes for directory names (e.g., `components/auth-wizard`).

## TypeScript and Zod Usage

- Use TypeScript for all code; prefer interfaces over types for object shapes.
- Utilize Zod for schema validation and type inference.
- Avoid enums; use literal types or maps instead.
- Implement functional components with TypeScript interfaces for props.

## Syntax and Formatting

- Use the `function` keyword for pure functions.
- Write declarative JSX with clear and readable structure.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.

## UI and Styling

- Use Tailwind CSS for styling with utility classes.
- Leverage Radix UI primitives for accessible components.
- Use class-variance-authority (CVA) for component variants.
- Implement responsive design with a mobile-first approach.
- Use lucide-react for icons.

## State Management and Data Fetching

- Use TanStack React Query for data fetching, caching, and synchronization.
- Utilize tRPC for type-safe API interactions.
- Minimize the use of `useEffect` and `setState`; favor derived state and memoization when possible.

## Error Handling and Validation

- Prioritize error handling and edge cases.
- Handle errors and edge cases at the beginning of functions.
- Use early returns for error conditions to avoid deep nesting.
- Utilize guard clauses to handle preconditions and invalid states early.
- Implement proper error logging and user-friendly error messages.
- Use custom error types or factories for consistent error handling.

## Performance Optimization

- Optimize for web performance.
- Use dynamic imports for code splitting in Next.js.
- Implement lazy loading for non-critical components.
- Optimize images using Next.js Image component.
- Leverage Turborepo's caching for build performance.

## Backend and Database

- Use Drizzle ORM for database interactions.
- Use Postgres as the database.
- Use tRPC for creating type-safe APIs.
- Use Zod schemas to validate data exchanged with the backend.

## Turborepo Best Practices

- Use `turbo dev` for concurrent development across packages
- Leverage build caching with proper `turbo.json` configuration
- Define clear dependencies between packages in `turbo.json`
- Use workspace protocols for internal package dependencies
- Run tasks efficiently with `turbo run build` or `turbo run lint`

## Key Conventions

- Ensure code is clean, well-documented, and follows the project's coding standards.
- Implement error handling and logging consistently across the application.
- Keep package boundaries clear - avoid circular dependencies.
- Use semantic versioning for package updates when needed.

## Follow Official Documentation

- Adhere to the official documentation for each technology used.
- For Next.js, focus on App Router, Server Components, and other modern Next.js patterns.
- Follow Turborepo best practices for monorepo management.

## Output Expectations

- Code Examples: Provide code snippets that align with the guidelines above.
- Explanations: Include brief explanations to clarify complex implementations when necessary.
- Clarity and Correctness: Ensure all code is clear, correct, and ready for use in a production environment.
- Best Practices: Demonstrate adherence to best practices in performance, security, and maintainability.

## Translation System

**Last Updated**: 2025-01-29

The monorepo uses a **dual translation system** following separation of concerns:

### File Structure
```
packages/ui/src/translations/     # Shared UI translations
├── en.json                       # Generic form labels, validation messages
└── nl.json

apps/{app}/messages/              # App-specific translations  
├── en.json                       # Business domain terms, app content
└── nl.json
```

### Usage Patterns

**Shared UI Components:**
```tsx
// packages/ui/src/form/start-time-entry.tsx
const t = useTranslations("form"); // Uses packages/ui/src/translations/
<Label>{t('hour')}</Label>         // "Hour" / "Uur"
```

**App Components:**
```tsx
// apps/plotty/components/poll-form.tsx  
const t = useTranslations("PollForm"); // Uses apps/plotty/messages/
<h2>{t('sections.event.title')}</h2>   // "Event" / "Gebeurtenis"
```

### What Goes Where

**Shared UI translations:** Form labels, validation messages, generic UI text
**App-specific translations:** Business domain terms, feature descriptions, app-specific content

**Rule:** If it contains business domain concepts (Poll, Task, etc.) → app-specific. If it's generic UI → shared.

## Migrating Old Code

Everything in `_OLD` is old code and READ ONLY. We have this folder to migrate to the new Turborepo system. When migrating:
- Move reusable components to `packages/ui/`
- Move API logic to `packages/trpc/`
- Refactor app-specific code to the appropriate app directory
- Update imports to use the new package structure

## Learnings Log

### 2025-01-06 - Download Progress Feature
- **TypeScript error fix**: Removed unused `prev` parameter in `setDownloadState` callback - changed from arrow function with unused param to direct object assignment.
- **Connection type showing "unknown"**: Fixed by adding 'prflx' (peer reflexive) candidate type detection - was missing this WebRTC candidate type in the logic.
- **Sender analytics integration**: Successfully integrated real-time analytics tracking into file transfer hook and created visual analytics panel with transfer status, session stats, and file download history.
- **Design uniformity improvement**: Integrated connection type indicator into existing connection status display and added transfer/download indicators directly to the file list, removing redundant analytics panel for cleaner UI.
- **Download lifecycle messaging**: Implemented complete message protocol for download notifications - DOWNLOAD_START, DOWNLOAD_COMPLETE, DOWNLOAD_ERROR messages now provide real-time feedback to senders about receiver download activities.
- **Visual progress bars enhancement**: Added upload progress tracking and visual progress bars for sender side - now shows real-time upload progress with percentage, speed (MB/s), and visual progress bars during file transfers.