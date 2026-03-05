# ============================================================
# VetNurse Frontend — Production Dockerfile
# Multi-stage build: deps → builder → runner
# ============================================================

# --- Stage 1: Install production dependencies only ----------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./
# Install only production dependencies (excludes devDependencies)
RUN yarn install --frozen-lockfile --production --ignore-engines

# --- Stage 2: Build the application -------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy ALL deps (including dev) just for the build step
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines

# Copy source
COPY . .

# Disable Next.js telemetry in CI/build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN yarn build

# --- Stage 3: Minimal production runtime --------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Cap heap to 512MB — adjust up if your server has more RAM dedicated to this process
ENV NODE_OPTIONS="--max-old-space-size=512"

# Run as non-root for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone output — only files needed to run the server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set correct ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
