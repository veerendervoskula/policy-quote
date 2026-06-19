# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# If using TypeScript or build step, enable this:
RUN npm run build

# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy only required files from builder
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app ./

# Set environment
ENV NODE_ENV=production

# Set correct permissions
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Expose application port
EXPOSE 3333

# Health check (used by ECS / Fargate)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --spider http://localhost:3333/health || exit 1

# Start server
CMD ["node", "server.js"]