#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📤 Exporting data from Docker database...${NC}"
echo ""

# Create backup directory
mkdir -p ./database-backup

# Export all data
docker exec skp-postgres pg_dump -U postgres -d skp_stock --data-only --inserts > ./database-backup/data-backup.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Data exported to: ./database-backup/data-backup.sql${NC}"
    echo ""
    
    # Show sample barcodes
    echo -e "${BLUE}📦 Sample barcodes from export:${NC}"
    grep "INSERT INTO public.products" ./database-backup/data-backup.sql | grep "RM-001" | head -1
    grep "INSERT INTO public.products" ./database-backup/data-backup.sql | grep "PKG-001" | head -1
    
    echo ""
    echo -e "${GREEN}💡 Use this file to import the same data consistently${NC}"
    echo -e "${YELLOW}   Import command: psql -U postgres -d skp_stock < ./database-backup/data-backup.sql${NC}"
else
    echo -e "${YELLOW}❌ Export failed!${NC}"
    exit 1
fi
