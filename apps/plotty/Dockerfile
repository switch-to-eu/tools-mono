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
# Create drizzle directory if it doesn't exist to prevent COPY from failing later
RUN mkdir -p /app/apps/plotty/drizzle
RUN pnpm turbo build --filter=@workspace/plotty

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install drizzle-kit to run migrations.
# It's installed globally here to avoid adding it to production dependencies.
RUN npm install -g drizzle-kit

# Copy required files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/apps/plotty/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/plotty/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/plotty/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/plotty/package.json ./package.json

# Copy Drizzle config and the migrations folder.
# The `drizzle` folder might not exist yet if you haven't created migrations.
# The COPY command will not fail if it's missing.
COPY --from=builder --chown=nextjs:nodejs /app/apps/plotty/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/apps/plotty/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/apps/plotty/server/db/schema.ts ./server/db/schema.ts


USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME="0.0.0.0"

# Create a startup script that runs migrations before starting the server
COPY --chown=nextjs:nodejs <<EOF /app/start.sh
#!/bin/sh
set -e
echo "Running database migrations..."
drizzle-kit migrate
echo "Starting server..."
exec node server.js
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]