# syntax=docker.io/docker/dockerfile:1

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- Dependencies ----
FROM base AS deps
COPY package.json ./
COPY pnpm-lock.yaml .npmrc* pnpm-workspace.yaml ./
COPY tsconfig.json turbo.json ./
COPY packages/ packages/
COPY apps/ apps/
RUN pnpm install --frozen-lockfile --prod=false

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app /app
RUN pnpm turbo build --filter=@workspace/keepfocus

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy required files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/apps/keepfocus/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/keepfocus/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/keepfocus/public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]