#!/bin/bash

# Vercel Deployment Script for ClinicIndia.fit
# This script automates the entire deployment process to Vercel

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_step() {
  echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  print_error "npm is not installed"
  exit 1
fi

if ! command -v git &> /dev/null; then
  print_error "git is not installed"
  exit 1
fi

print_success "All prerequisites installed"

# Step 1: Install Vercel CLI
print_step "Step 1: Installing Vercel CLI..."
npm install -g vercel
print_success "Vercel CLI installed"

# Step 2: Login to Vercel
print_step "Step 2: Logging in to Vercel..."
print_warning "You will be prompted to authenticate with Vercel"
vercel login
print_success "Vercel login successful"

# Step 3: Install frontend dependencies
print_step "Step 3: Installing frontend dependencies..."
cd frontend
npm install
print_success "Frontend dependencies installed"

# Step 4: Link project to Vercel
print_step "Step 4: Linking project to Vercel..."
vercel link --confirm
print_success "Project linked to Vercel"

# Step 5: Pull environment variables from Vercel
print_step "Step 5: Pulling environment variables from Vercel..."
if [ -f .env.local ]; then
  print_warning ".env.local already exists, skipping pull"
else
  vercel env pull
  print_success "Environment variables pulled from Vercel"
fi

# Step 6: Build locally to test
print_step "Step 6: Building project locally to test..."
npm run build
print_success "Build successful"

# Step 7: Deploy to Vercel
print_step "Step 7: Deploying to Vercel..."
print_warning "Deploying to production..."
DEPLOYMENT_URL=$(vercel --prod 2>&1 | grep -oP 'https://[^ ]+' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
  print_error "Failed to get deployment URL"
  DEPLOYMENT_URL="Check Vercel dashboard"
fi

print_success "Deployment URL: $DEPLOYMENT_URL"

# Step 8: Verify deployment
print_step "Step 8: Verifying deployment..."
sleep 5

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 307 ]; then
  print_success "Deployment verified successfully (HTTP $RESPONSE)"
else
  print_warning "Received HTTP $RESPONSE - deployment may still be initializing"
fi

# Step 9: Check API endpoint
print_step "Step 9: Checking API endpoint..."
API_RESPONSE=$(curl -s "$DEPLOYMENT_URL/api/health" | head -c 50)
if [[ "$API_RESPONSE" == *"healthy"* ]] || [[ "$API_RESPONSE" == *"status"* ]]; then
  print_success "API endpoint is responding"
else
  print_warning "API endpoint may need time to initialize"
fi

# Step 10: Display next steps
print_step "Deployment Steps Complete!"
echo ""
echo -e "${GREEN}🎉 Your application has been deployed to Vercel!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. ${YELLOW}Configure DNS Records${NC}"
echo "   - Go to your domain registrar"
echo "   - Add CNAME record: www.clinicindia.fit → cname.vercel.com"
echo "   - Add A record: clinicindia.fit → Vercel IP"
echo ""
echo "2. ${YELLOW}Set Environment Variables${NC}"
echo "   - Go to Vercel Dashboard → Project Settings → Environment Variables"
echo "   - Add all required variables from .env.production"
echo "   - Redeploy after setting variables"
echo ""
echo "3. ${YELLOW}Verify SSL Certificate${NC}"
echo "   - Wait 5-30 minutes for Let's Encrypt certificate"
echo "   - Check Vercel Dashboard → Domains for status"
echo ""
echo "4. ${YELLOW}Test Your Application${NC}"
echo "   - Frontend: https://clinicindia.fit"
echo "   - API: https://clinicindia.fit/api/health"
echo ""
echo "📍 Deployment URL: ${DEPLOYMENT_URL}"
echo ""
echo "View your deployment:"
echo "  vercel deployments"
echo ""
echo "View logs:"
echo "  vercel logs"
echo ""
echo "Rollback to previous deployment:"
echo "  vercel rollback"
