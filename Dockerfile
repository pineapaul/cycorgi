# -------------------------
# 1) Dependencies layer
# -------------------------
    FROM node:20-alpine AS deps
    WORKDIR /app
    
    # Install dependencies (includes dev deps needed to build)
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # -------------------------
    # 2) Build layer
    # -------------------------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Bring in node_modules from deps
    COPY --from=deps /app/node_modules ./node_modules
    
    # Copy source
    COPY . .
    
    # IMPORTANT: build should NOT require secrets/env.
    # Ensure your code only reads MONGODB_URI / NEXTAUTH_* at runtime.
    RUN npm run build
    
    # Prune dev deps for a smaller, safer runtime
    RUN npm prune --omit=dev
    
    # -------------------------
    # 3) Runtime layer
    # -------------------------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Security: run as non-root
    RUN addgroup -g 1001 -S nodejs \
      && adduser -S nextjs -u 1001
    USER nextjs
    
    # Copy only what we need to run
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    
    # Runtime env (Cloud Run injects secrets via env vars)
    ENV NODE_ENV=production
    ENV PORT=8080
    ENV HOSTNAME=0.0.0.0
    
    EXPOSE 8080
    CMD ["npm", "start"]
    