#!/bin/bash

# Clinic India - DNS Setup Guide Script
# This script helps configure DNS records for clinicindia.fit

set -e

echo "🌐 Clinic India - DNS Configuration Helper"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to display DNS records
show_dns_records() {
    local server_ip=$1
    
    echo ""
    echo -e "${BLUE}Required DNS Records for clinicindia.fit:${NC}"
    echo "=========================================="
    echo ""
    
    echo "1️⃣  A Record (Primary Domain)"
    echo "   Type: A"
    echo "   Name: @"
    echo -e "   Value: ${GREEN}$server_ip${NC}"
    echo "   TTL: 3600"
    echo ""
    
    echo "2️⃣  A Record (WWW subdomain)"
    echo "   Type: A"
    echo "   Name: www"
    echo -e "   Value: ${GREEN}$server_ip${NC}"
    echo "   TTL: 3600"
    echo ""
    
    echo "3️⃣  CNAME Record (API subdomain - Optional)"
    echo "   Type: CNAME"
    echo "   Name: api"
    echo "   Value: clinicindia.fit"
    echo "   TTL: 3600"
    echo ""
    
    echo "4️⃣  MX Record (Email - Optional)"
    echo "   Type: MX"
    echo "   Name: @"
    echo "   Value: mail.protonmail.com"
    echo "   TTL: 3600"
    echo "   Priority: 10"
    echo ""
}

# Function to check DNS propagation
check_dns() {
    local domain=$1
    
    echo -e "${YELLOW}Checking DNS records...${NC}"
    echo ""
    
    if command -v nslookup &> /dev/null; then
        echo "Using nslookup:"
        nslookup $domain 8.8.8.8 || echo "DNS record not yet propagated"
        echo ""
    fi
    
    if command -v dig &> /dev/null; then
        echo "Using dig:"
        dig +short $domain || echo "DNS record not yet propagated"
        echo ""
    fi
}

# Function to show registrar instructions
show_registrar_instructions() {
    echo -e "${BLUE}Common Domain Registrars - Where to Update DNS:${NC}"
    echo "=========================================="
    echo ""
    echo "🔗 GoDaddy: https://www.godaddy.com/help/manage-dns-757"
    echo "🔗 Namecheap: https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-free-dns-records"
    echo "🔗 Bluehost: https://www.bluehost.com/help/article/name-servers-and-dns"
    echo "🔗 HostGator: https://www.hostgator.com/help/article/manage-dns-records"
    echo "🔗 Google Domains: https://support.google.com/domains/answer/3290350"
    echo "🔗 Route 53 (AWS): https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-api-gateway.html"
    echo "🔗 Azure DNS: https://docs.microsoft.com/en-us/azure/dns/dns-getstarted-portal"
    echo "🔗 CloudFlare: https://support.cloudflare.com/hc/en-us/articles/200168926-How-do-I-add-a-CNAME-record"
    echo ""
}

# Main menu
show_menu() {
    echo -e "${BLUE}What would you like to do?${NC}"
    echo "1. Display DNS records to configure"
    echo "2. Check DNS propagation"
    echo "3. Show registrar instructions"
    echo "4. Display complete deployment steps"
    echo "5. Exit"
    echo ""
}

# Deployment steps
show_deployment_steps() {
    echo -e "${BLUE}Complete Deployment Checklist:${NC}"
    echo "=========================================="
    echo ""
    echo "📋 STEP 1: Prepare Server"
    echo "   ☐ Get a VPS (AWS, DigitalOcean, Azure, GCP)"
    echo "   ☐ Record your server IP address"
    echo "   ☐ SSH into your server"
    echo ""
    
    echo "📋 STEP 2: Setup DNS"
    echo "   ☐ Update DNS records at your registrar"
    echo "   ☐ Point @ and www to your server IP"
    echo "   ☐ Wait 24-48 hours for propagation"
    echo ""
    
    echo "📋 STEP 3: Setup Server"
    echo "   \$ sudo bash scripts/setup-production.sh"
    echo ""
    
    echo "📋 STEP 4: Clone Repository"
    echo "   \$ cd /var/www"
    echo "   \$ git clone <your-repo> clinicindia"
    echo "   \$ cd clinicindia"
    echo ""
    
    echo "📋 STEP 5: Configure Environment"
    echo "   \$ cp .env.production .env"
    echo "   \$ sudo nano .env  # Edit with your values"
    echo ""
    
    echo "📋 STEP 6: Deploy Application"
    echo "   \$ sudo bash scripts/deploy-live.sh"
    echo ""
    
    echo "📋 STEP 7: Verify Deployment"
    echo "   \$ curl https://clinicindia.fit"
    echo "   \$ curl https://clinicindia.fit/api/health"
    echo ""
    
    echo -e "${GREEN}✅ Your site is now live at https://clinicindia.fit${NC}"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            read -p "Enter your server IP address: " server_ip
            show_dns_records $server_ip
            ;;
        2)
            check_dns "clinicindia.fit"
            ;;
        3)
            show_registrar_instructions
            ;;
        4)
            show_deployment_steps
            ;;
        5)
            echo -e "${GREEN}Goodbye! 👋${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
