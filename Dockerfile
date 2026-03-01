# ============================================================
# VetNurse Frontend — Production Dockerfile
# Multi-stage build for Bun + Vite
# ============================================================

# --- Stage 1: Build the Vite application ----------------------
FROM oven/bun:alpine AS builder
WORKDIR /app

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
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Run as non-root
USER bun

# Copy package info and lockfile
COPY package.json bun.lock ./

# Install only production dependencies (Hono, AWS SDK, etc)
RUN bun install --production --frozen-lockfile

# Copy built static files
COPY --from=builder --chown=bun:bun /app/dist ./dist

# Copy the server entrypoint
COPY --from=builder --chown=bun:bun /app/server.ts ./

EXPOSE 3000

# Start the Hono server using Bun
CMD ["bun", "run", "server.ts"]
