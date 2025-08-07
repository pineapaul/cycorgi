# Step 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build

# Step 2: Run
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy only necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
CMD ["npx", "next", "start", "-p", "8080"]