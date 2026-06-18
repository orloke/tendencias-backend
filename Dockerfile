# Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3001

# Execute Prisma migrations and start the NestJS server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
