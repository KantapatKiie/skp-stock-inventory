#!/bin/sh
set -e

echo "🚀 Starting backend setup..."

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Check if database is empty (no users)
echo "🔍 Checking if database needs seeding..."
USER_COUNT=$(node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.count().then(count => { console.log(count); prisma.\$disconnect(); });" 2>/dev/null || echo "0")

echo "User count: $USER_COUNT"

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Seeding database..."
  node -e "require('./prisma/seed.js')" || echo "⚠️  Seed skipped - will be available on manual run"
else
  echo "✅ Database already seeded"
fi

echo "✅ Backend setup complete!"
echo "🚀 Starting server..."

# Start the application
exec node dist/index.js
