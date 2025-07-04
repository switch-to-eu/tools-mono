# syntax=docker.io/docker/dockerfile:1

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- Dependencies ----
# First, install all dependencies in the monorepo
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc* pnpm-workspace.yaml ./
# Copy all package.json files from the workspace
COPY packages/**/package.json ./packages/
COPY apps/**/package.json ./apps/
RUN pnpm install --frozen-lockfile --prod=false

# ---- Builder ----
# This stage builds the target app using the pnpm deploy method
FROM base AS builder
WORKDIR /app

# First, copy the full source code
COPY . .
# Then, copy the installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Use pnpm deploy to create a self-contained folder with the app and its dependencies
RUN pnpm deploy --legacy --filter=@workspace/keepfocus ./deploy

# Run the build inside the deployed folder
WORKDIR /app/deploy
RUN pnpm next build

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the deployed and built app from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/deploy .

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".next/standalone/server.js"]