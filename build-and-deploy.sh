#!/bin/bash

echo "🔄 Rebuilding and Deploying SKP Stock System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Run build
echo -e "${BLUE}Step 1: Building...${NC}"
./build.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Deploying...${NC}"
./deploy.sh

echo ""
echo -e "${GREEN}✅ Build and Deploy complete!${NC}"
