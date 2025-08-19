# -------------------------
# 1) Dependencies layer
# -------------------------
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Install Playwright Chromium + OS deps
# RUN npx playwright@latest install --with-deps chromium

# Install git/ca-certificates for npm if you fetch from git, then deps
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Important: this will download Chromium for puppeteer at install time
# (ensure puppeteer is in "dependencies", not "devDependencies")
RUN npm ci

# -------------------------
# 2) Build layer
# -------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build (should not require secrets)
RUN npm run build

# Prune dev deps; keep puppeteer (must be in dependencies)
RUN npm prune --omit=dev

# -------------------------
# 3) Runtime layer
# -------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Install Chromium runtime deps + common fonts (for text/emoji/CJK)
RUN apt-get update && apt-get install -y --no-install-recommends \
  # chrome / headless deps
  libnss3 libxss1 libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libxdamage1 libxrandr2 libgbm1 libxshmfence1 libxcomposite1 libxfixes3 \
  libpango-1.0-0 libx11-6 libxext6 libx11-xcb1 \
  # fonts
  fonts-liberation fonts-noto fonts-noto-cjk fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
USER nextjs

# Copy runtime artefacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Env
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
# Hint puppeteer to use its bundled Chromium (no custom path needed)
ENV PUPPETEER_EXECUTABLE_PATH=""

EXPOSE 8080
CMD ["npm", "start"]
