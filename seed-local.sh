#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Seeding Local Database...${NC}"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Run seed
echo -e "${YELLOW}Running seed script...${NC}"
npx tsx prisma/seed.ts

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Local database seeded successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Verifying data via API...${NC}"
    
    # Wait a moment for data to be available
    sleep 2
    
    # Test if backend is running
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        # Get token and check products
        TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
            -H "Content-Type: application/json" \
            -d '{"email":"admin@skp.com","password":"admin123"}' | jq -r '.data.accessToken')
        
        if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
            echo -e "${GREEN}✅ Authentication successful${NC}"
            
            PRODUCT_COUNT=$(curl -s "http://localhost:3001/api/products?limit=100" \
                -H "Authorization: Bearer $TOKEN" | jq '.data.pagination.total')
            
            INVENTORY_COUNT=$(curl -s "http://localhost:3001/api/inventory?limit=1000" \
                -H "Authorization: Bearer $TOKEN" | jq '.data.pagination.total')
            
            echo -e "${GREEN}✅ Total Products: $PRODUCT_COUNT${NC}"
            echo -e "${GREEN}✅ Total Inventory Items: $INVENTORY_COUNT${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend not running or authentication failed${NC}"
            echo -e "${YELLOW}💡 Start backend to verify via API: cd backend && npm run dev${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Backend is not running${NC}"
        echo -e "${YELLOW}💡 Start backend to verify via API: cd backend && npm run dev${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}❌ Seed failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Local seed completed!${NC}"
