# Dockerfile

# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept Mongo URI at build time
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Must re-set env in final stage
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

EXPOSE 8080
CMD ["npm", "start"]
