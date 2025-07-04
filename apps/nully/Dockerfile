# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy monorepo workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/nully/ ./apps/nully/

# Install dependencies with pnpm
RUN corepack enable pnpm && pnpm i --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY --from=deps /app ./

# Initialize git submodules if they exist
RUN if [ -f .gitmodules ]; then \
      git submodule update --init --recursive; \
    fi

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

# Enable pnpm and build the nully app
RUN corepack enable pnpm && pnpm run build --filter=@workspace/nully

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs

RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/nully/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nully/.next/static ./apps/nully/.next/static

USER nextjs

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"

COPY --chown=nextjs:nodejs <<EOF /app/start.sh
#!/bin/sh
echo "Starting server..."
cd /app/apps/nully
exec node server.js
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]