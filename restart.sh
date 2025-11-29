#!/bin/bash

echo "🔄 Quick Restart (without rebuild)..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Restarting containers...${NC}"
docker-compose restart

echo ""
echo -e "${GREEN}✅ Restart complete!${NC}"
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "Backend:  ${BLUE}http://localhost:3001/api${NC}"
