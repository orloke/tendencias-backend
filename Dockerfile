# Build stage
FROM node:20-slim AS builder
WORKDIR /usr/src/app
COPY package*.json tsconfig*.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma/
RUN npm ci
COPY src ./src
RUN npx prisma generate && npm run build

# Production stage
FROM node:20-slim AS runner
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json tsconfig*.json nest-cli.json prisma.config.ts ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 8080
CMD sh -c "npx prisma migrate deploy && node dist/main.js"
