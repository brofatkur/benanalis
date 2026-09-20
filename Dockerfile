FROM node:20-alpine AS base

# Step 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Step 2: Build the Next.js application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass build-time Next.js public variables
ARG NEXT_PUBLIC_INSFORGE_BASE_URL="http://43.157.228.75:7130"
ARG NEXT_PUBLIC_INSFORGE_ANON_KEY="anon_0a75c32f9a5fa623748cae8ca28764bf213bc112"
ENV NEXT_PUBLIC_INSFORGE_BASE_URL=${NEXT_PUBLIC_INSFORGE_BASE_URL}
ENV NEXT_PUBLIC_INSFORGE_ANON_KEY=${NEXT_PUBLIC_INSFORGE_ANON_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Step 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/public* ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
