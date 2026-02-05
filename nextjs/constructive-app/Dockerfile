# syntax=docker/dockerfile:1.6

##
## 1) Build stage (FAST): runs on BUILDPLATFORM (usually amd64 on GitHub runners)
##
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    # Use production mode for Next.js builds to avoid
    # non-standard NODE_ENV warnings and build-time errors.
    NODE_ENV=production \
    HUSKY=0

# Tooling needed if any native deps must compile during install on Alpine
RUN apk add --no-cache libc6-compat python3 make g++

# Copy root workspace files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace package.json files (needed for pnpm install)
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui/package.json ./packages/ui/
COPY packages/graphiql-devtool/package.json ./packages/graphiql-devtool/

# Install all deps using pnpm (workspace-aware)
RUN corepack enable && pnpm install --frozen-lockfile

# Copy source files
COPY apps/admin ./apps/admin
COPY packages/ui ./packages/ui
COPY packages/graphiql-devtool ./packages/graphiql-devtool

# Build workspace packages first, then the admin app
RUN pnpm --filter @constructive-io/ui build && \
    pnpm --filter @constructive-io/graphiql-devtool build && \
    pnpm --filter @constructive-io/admin build

# IMPORTANT:
# Remove build-platform node_modules from the standalone output.
# We'll inject TARGETPLATFORM production node_modules (sharp etc.) later.
RUN rm -rf apps/admin/.next/standalone/apps/admin/node_modules || true


##
## 2) Prod deps stage (CORRECTNESS): runs on TARGETPLATFORM (amd64/arm64)
##    This is where sharp gets installed for the correct arch (linux-musl).
##
FROM --platform=$TARGETPLATFORM node:22-alpine AS proddeps
WORKDIR /app

ENV NODE_ENV=production \
    HUSKY=0

RUN apk add --no-cache libc6-compat python3 make g++

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace package.json files
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui/package.json ./packages/ui/
COPY packages/graphiql-devtool/package.json ./packages/graphiql-devtool/

# Install prod deps only using pnpm
RUN corepack enable && pnpm install --frozen-lockfile --prod


##
## 3) Runtime stage (Alpine)
##
FROM node:22-alpine AS runner
WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/constructive-io/dashboard"

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0

# If you know you don't need this, you can remove it
RUN apk add --no-cache libc6-compat

# Copy the .pnpm store at root (has actual package files)
COPY --from=proddeps --chown=node:node /app/node_modules ./node_modules

# Copy the app's node_modules (symlinks that point to ../../../node_modules/.pnpm)
COPY --from=proddeps --chown=node:node /app/apps/admin/node_modules ./apps/admin/node_modules

# Copy Next standalone output preserving monorepo structure for symlink resolution
COPY --from=build --chown=node:node /app/apps/admin/.next/standalone/apps/admin ./apps/admin/
COPY --from=build --chown=node:node /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build --chown=node:node /app/apps/admin/public ./apps/admin/public

# Entry point (no extra RUN chmod)
COPY --chmod=755 --chown=node:node apps/admin/docker-entrypoint.sh /docker-entrypoint.sh

# Change to app directory so module resolution finds node_modules/next -> ../../../node_modules/.pnpm/...
WORKDIR /app/apps/admin

USER node
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
