# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# Stage 2: Build application
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files (excluding what's in .dockerignore)
COPY . .

# Build with production settings
RUN npm run build && \
    npm prune --omit=dev

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=6001

# Copy only necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/next.config.js ./

# Set up non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 6001

# Use node directly instead of npm for better process management
CMD ["node", "server.js"]
