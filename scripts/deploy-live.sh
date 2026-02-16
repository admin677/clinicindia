#!/bin/bash

# Clinic India - Deployment Script
# This script deploys the application using Docker Compose

set -e

DOMAIN="clinicindia.fit"
EMAIL="admin@clinicindia.fit"
APP_DIR="/var/www/clinicindia"
BACKUP_DIR="/var/backups/clinicindia"

echo "🏥 Clinic India - Live Deployment Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ============================================
# 1. Pre-deployment Checks
# ============================================
echo -e "${YELLOW}[1/8] Running pre-deployment checks...${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Check required tools
for cmd in docker docker-compose git curl; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}✗ $cmd is not installed${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ All prerequisites met${NC}"

# ============================================
# 2. Backup Current Database
# ============================================
echo -e "${YELLOW}[2/8] Backing up current database...${NC}"

mkdir -p $BACKUP_DIR

BACKUP_FILE="$BACKUP_DIR/clinicindia_$(date +%Y%m%d_%H%M%S).sql.gz"

if docker-compose -f $APP_DIR/docker-compose.yml ps postgres | grep -q "Up"; then
    docker-compose -f $APP_DIR/docker-compose.yml exec -T postgres pg_dump -U postgres clinicindia | gzip > $BACKUP_FILE
    echo -e "${GREEN}✓ Database backed up to: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}! PostgreSQL not running, skipping backup${NC}"
fi

# ============================================
# 3. Pull Latest Code
# ============================================
echo -e "${YELLOW}[3/8] Pulling latest code from repository...${NC}"

cd $APP_DIR
git fetch origin
git reset --hard origin/main

echo -e "${GREEN}✓ Code updated${NC}"

# ============================================
# 4. Build Docker Images
# ============================================
echo -e "${YELLOW}[4/8] Building Docker images...${NC}"

docker-compose -f docker-compose.yml build --no-cache

echo -e "${GREEN}✓ Docker images built${NC}"

# ============================================
# 5. Start Services
# ============================================
echo -e "${YELLOW}[5/8] Starting services...${NC}"

docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d

echo -e "${GREEN}✓ Services started${NC}"

# ============================================
# 6. Run Database Migrations
# ============================================
echo -e "${YELLOW}[6/8] Running database migrations...${NC}"

sleep 10  # Wait for PostgreSQL to start

docker-compose -f docker-compose.yml exec -T postgres psql -U postgres clinicindia < $APP_DIR/database/schema.sql

echo -e "${GREEN}✓ Migrations completed${NC}"

# ============================================
# 7. Setup SSL Certificate
# ============================================
echo -e "${YELLOW}[7/8] Setting up SSL certificate...${NC}"

if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "Setting up Let's Encrypt certificate..."
    
    docker-compose -f docker-compose.yml exec -T certbot certbot certonly \
        --webroot -w /var/www/certbot \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive \
        --quiet
    
    echo -e "${GREEN}✓ SSL certificate configured${NC}"
else
    echo -e "${GREEN}✓ SSL certificate already exists${NC}"
fi

# ============================================
# 8. Health Checks
# ============================================
echo -e "${YELLOW}[8/8] Running health checks...${NC}"

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ $BACKEND_STATUS -eq 200 ]; then
    echo -e "${GREEN}✓ Backend: OK ($BACKEND_STATUS)${NC}"
else
    echo -e "${RED}✗ Backend: ERROR ($BACKEND_STATUS)${NC}"
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ $FRONTEND_STATUS -eq 200 ] || [ $FRONTEND_STATUS -eq 307 ]; then
    echo -e "${GREEN}✓ Frontend: OK ($FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}✗ Frontend: ERROR ($FRONTEND_STATUS)${NC}"
fi

# Check PostgreSQL
POSTGRES_CHECK=$(docker-compose -f docker-compose.yml exec -T postgres pg_isready -U postgres)
if echo $POSTGRES_CHECK | grep -q "accepting connections"; then
    echo -e "${GREEN}✓ PostgreSQL: OK${NC}"
else
    echo -e "${RED}✗ PostgreSQL: ERROR${NC}"
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "🌐 Website is now live at: https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f [service_name]"
echo "  Restart services: docker-compose restart"
echo "  Stop services: docker-compose down"
echo "  Database backup: pg_dump clinicindia > backup.sql"
echo ""
echo "Backup location: $BACKUP_FILE"
echo ""
