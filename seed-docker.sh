#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Seeding Docker Database...${NC}"
echo ""

# Check if Docker containers are running
if ! docker ps | grep -q skp-backend; then
    echo -e "${RED}❌ Docker backend container is not running!${NC}"
    echo -e "${YELLOW}💡 Start containers first: docker-compose up -d${NC}"
    exit 1
fi

if ! docker ps | grep -q skp-postgres; then
    echo -e "${RED}❌ Docker postgres container is not running!${NC}"
    echo -e "${YELLOW}💡 Start containers first: docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker containers are running${NC}"
echo ""

# Run seed in Docker container
echo -e "${YELLOW}Running seed in Docker backend container...${NC}"
docker exec skp-backend npm run seed

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Docker database seeded successfully!${NC}"
    echo ""
    
    # Verify via API
    echo -e "${BLUE}📊 Verifying data via API...${NC}"
    sleep 2
    
    # Get token
    TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@skp.com","password":"admin123"}' | jq -r '.data.accessToken')
    
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Authentication successful${NC}"
        
        # Get counts
        PRODUCT_COUNT=$(curl -s "http://localhost:3001/api/products?limit=100" \
            -H "Authorization: Bearer $TOKEN" | jq '.data.pagination.total')
        
        INVENTORY_COUNT=$(curl -s "http://localhost:3001/api/inventory?limit=1000" \
            -H "Authorization: Bearer $TOKEN" | jq '.data.pagination.total')
        
        USER_COUNT=$(curl -s "http://localhost:3001/api/users?limit=100" \
            -H "Authorization: Bearer $TOKEN" | jq '.data.pagination.total')
        
        echo -e "${GREEN}✅ Total Users: $USER_COUNT${NC}"
        echo -e "${GREEN}✅ Total Products: $PRODUCT_COUNT${NC}"
        echo -e "${GREEN}✅ Total Inventory Items: $INVENTORY_COUNT${NC}"
        
        # Show sample products with barcodes
        echo ""
        echo -e "${BLUE}📦 Sample Products:${NC}"
        curl -s "http://localhost:3001/api/products?limit=3" \
            -H "Authorization: Bearer $TOKEN" | jq -r '.data.products[] | "  • \(.sku) - \(.name) [\(.barcode)]"'
    else
        echo -e "${YELLOW}⚠️  Authentication failed${NC}"
    fi
    
    # Verify via Docker postgres
    echo ""
    echo -e "${BLUE}📊 Database statistics from Docker postgres:${NC}"
    docker exec skp-postgres psql -U postgres -d skp_stock -c "
        SELECT 
            'Products' as table_name, COUNT(*) as count FROM products
        UNION ALL
        SELECT 'Users', COUNT(*) FROM users
        UNION ALL
        SELECT 'Categories', COUNT(*) FROM categories
        UNION ALL
        SELECT 'Warehouses', COUNT(*) FROM warehouses
        UNION ALL
        SELECT 'Inventory', COUNT(*) FROM inventory
        UNION ALL
        SELECT 'Transactions', COUNT(*) FROM transactions;
    "
else
    echo ""
    echo -e "${RED}❌ Seed failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Docker seed completed!${NC}"
echo -e "${BLUE}🚀 Access your application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC} (Docker) or ${GREEN}http://localhost:5173${NC} (Dev)"
echo -e "   Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "   Login:    ${YELLOW}admin@skp.com / admin123${NC}"
