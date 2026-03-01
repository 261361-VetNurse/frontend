# ============================================================
# VetNurse Frontend — Production Dockerfile
# Multi-stage build for Bun + Vite
# ============================================================

# --- Stage 1: Build the Vite application ----------------------
FROM oven/bun:debian AS builder
WORKDIR /petlite

# Copy dependency definition
COPY package.json bun.lock ./

# Install all dependencies (needed to build frontend)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Build the Vite static assets to dist/
RUN bun run build

# --- Stage 2: Minimal production runtime ----------------------
FROM oven/bun:debian AS runner
WORKDIR /petlite

ENV NODE_ENV=production
ENV PORT=3000

# Grant bun user access to /petlite
USER root
RUN mkdir -p /petlite && chown -R bun:bun /petlite

# Run as non-root
USER bun

# Copy package info and lockfile
COPY --chown=bun:bun package.json bun.lock ./

# Install only production dependencies (Hono, AWS SDK, etc)
RUN bun install --production --frozen-lockfile

# Copy built static files
COPY --from=builder --chown=bun:bun /petlite/dist ./dist

# Copy the server entrypoint
COPY --from=builder --chown=bun:bun /petlite/server.ts ./

EXPOSE 3000

# Start the Hono server using Bun
CMD ["bun", "run", "server.ts"]
