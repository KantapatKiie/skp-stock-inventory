# Backend Dockerfile
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy prisma schema
COPY prisma ./prisma

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript (including seed script)
RUN npm run build && npx tsc prisma/seed.ts --outDir dist/prisma --moduleResolution node --esModuleInterop || echo "Seed compilation skipped"

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5000

# Start command
ENTRYPOINT ["/app/docker-entrypoint.sh"]
