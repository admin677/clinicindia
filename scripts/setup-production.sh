#!/bin/bash

# Clinic India - Production Deployment Script
# This script sets up the complete production environment

set -e

echo "🏥 Clinic India - Production Deployment Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# ============================================
# 1. System Update & Dependencies
# ============================================
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y curl wget git vim htop

# ============================================
# 2. Install Node.js & npm
# ============================================
echo -e "${YELLOW}[2/10] Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node_version=$(node -v)
npm_version=$(npm -v)
echo -e "${GREEN}✓ Node.js: $node_version, npm: $npm_version${NC}"

# ============================================
# 3. Install PostgreSQL
# ============================================
echo -e "${YELLOW}[3/10] Installing PostgreSQL...${NC}"
apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Verify PostgreSQL
pg_version=$(psql --version)
echo -e "${GREEN}✓ PostgreSQL: $pg_version${NC}"

# ============================================
# 4. Install Docker & Docker Compose
# ============================================
echo -e "${YELLOW}[4/10] Installing Docker & Docker Compose...${NC}"
apt-get install -y docker.io docker-compose
systemctl start docker
systemctl enable docker

# Add current user to docker group
usermod -aG docker $SUDO_USER

echo -e "${GREEN}✓ Docker installed${NC}"

# ============================================
# 5. Install Nginx
# ============================================
echo -e "${YELLOW}[5/10] Installing Nginx...${NC}"
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx installed and running${NC}"

# ============================================
# 6. Install Certbot for SSL
# ============================================
echo -e "${YELLOW}[6/10] Installing Certbot for SSL/TLS...${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "${GREEN}✓ Certbot installed${NC}"

# ============================================
# 7. Install PM2 for process management
# ============================================
echo -e "${YELLOW}[7/10] Installing PM2...${NC}"
npm install -g pm2
pm2 startup

echo -e "${GREEN}✓ PM2 installed${NC}"

# ============================================
# 8. Create application directories
# ============================================
echo -e "${YELLOW}[8/10] Creating application directories...${NC}"
mkdir -p /var/www/clinicindia
mkdir -p /var/www/clinicindia/uploads
mkdir -p /var/backups/clinicindia
mkdir -p /var/logs/clinicindia

# Set permissions
chown -R $SUDO_USER:$SUDO_USER /var/www/clinicindia
chmod -R 755 /var/www/clinicindia

echo -e "${GREEN}✓ Directories created${NC}"

# ============================================
# 9. Setup PostgreSQL database
# ============================================
echo -e "${YELLOW}[9/10] Setting up PostgreSQL database...${NC}"

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE clinicindia;
CREATE USER clinicindia WITH ENCRYPTED PASSWORD 'change_this_password_in_production';
ALTER ROLE clinicindia SET client_encoding TO 'utf8';
ALTER ROLE clinicindia SET default_transaction_isolation TO 'read committed';
ALTER ROLE clinicindia SET default_transaction_deferrable TO on;
ALTER ROLE clinicindia SET default_transaction_read_committed TO 'on';
ALTER ROLE clinicindia SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE clinicindia TO clinicindia;
ALTER USER clinicindia CREATEDB;
EOF

echo -e "${GREEN}✓ PostgreSQL database created${NC}"

# ============================================
# 10. Create firewall rules
# ============================================
echo -e "${YELLOW}[10/10] Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable -y

echo -e "${GREEN}✓ Firewall configured${NC}"

# ============================================
# Summary
# ============================================
echo ""
echo -e "${GREEN}✅ Production environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Clone the repository to /var/www/clinicindia"
echo "2. Configure environment variables in .env files"
echo "3. Run database migrations"
echo "4. Configure Nginx reverse proxy"
echo "5. Setup SSL certificate with Certbot"
echo "6. Deploy using PM2 or Docker"
echo ""
echo "Useful commands:"
echo "  - Check services: systemctl status nginx postgresql docker"
echo "  - View logs: tail -f /var/logs/clinicindia/*.log"
echo "  - Database backup: pg_dump clinicindia > backup.sql"
echo ""
