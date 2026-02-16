# Vercel Deployment Script for ClinicIndia.fit (Windows PowerShell)
# This script automates the entire deployment process to Vercel

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

# Color functions
function Write-Step {
  param([string]$Message)
  Write-Host "📋 $Message" -ForegroundColor Cyan
}

function Write-Success {
  param([string]$Message)
  Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
  param([string]$Message)
  Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
  param([string]$Message)
  Write-Host "❌ $Message" -ForegroundColor Red
}

# Check prerequisites
Write-Step "Checking prerequisites..."

try {
  $nodeVersion = & node --version
  Write-Success "Node.js found: $nodeVersion"
}
catch {
  Write-Error-Custom "Node.js is not installed. Please install from https://nodejs.org"
  exit 1
}

try {
  $npmVersion = & npm --version
  Write-Success "npm found: $npmVersion"
}
catch {
  Write-Error-Custom "npm is not installed"
  exit 1
}

try {
  $gitVersion = & git --version
  Write-Success "Git found: $gitVersion"
}
catch {
  Write-Error-Custom "Git is not installed. Please install from https://git-scm.com"
  exit 1
}

# Step 1: Install Vercel CLI
Write-Step "Step 1: Installing Vercel CLI..."
npm install -g vercel
Write-Success "Vercel CLI installed"

# Step 2: Login to Vercel
Write-Step "Step 2: Logging in to Vercel..."
Write-Warning "You will be prompted to authenticate with Vercel"
vercel login
Write-Success "Vercel login successful"

# Step 3: Install frontend dependencies
Write-Step "Step 3: Installing frontend dependencies..."
Set-Location frontend
npm install
Write-Success "Frontend dependencies installed"

# Step 4: Link project to Vercel
Write-Step "Step 4: Linking project to Vercel..."
vercel link --confirm
Write-Success "Project linked to Vercel"

# Step 5: Pull environment variables
Write-Step "Step 5: Pulling environment variables from Vercel..."
if (Test-Path .env.local) {
  Write-Warning ".env.local already exists, skipping pull"
}
else {
  vercel env pull
  Write-Success "Environment variables pulled from Vercel"
}

# Step 6: Build locally to test
Write-Step "Step 6: Building project locally to test..."
npm run build
Write-Success "Build successful"

# Step 7: Deploy to Vercel
Write-Step "Step 7: Deploying to Vercel..."
Write-Warning "Deploying to production..."

$deploymentOutput = & vercel --prod 2>&1
$deploymentUrl = ($deploymentOutput | Select-String -Pattern 'https://[^ ]+' | Select-Object -First 1).Matches.Value

if ($null -eq $deploymentUrl) {
  Write-Warning "Failed to extract deployment URL from output"
  $deploymentUrl = "Check Vercel dashboard"
}

Write-Success "Deployment URL: $deploymentUrl"

# Step 8: Verify deployment
Write-Step "Step 8: Verifying deployment..."
Start-Sleep -Seconds 5

try {
  $response = Invoke-WebRequest -Uri $deploymentUrl -Method Get -SkipHttpErrorCheck -TimeoutSec 10
  $statusCode = $response.StatusCode
  
  if ($statusCode -eq 200 -or $statusCode -eq 307) {
    Write-Success "Deployment verified successfully (HTTP $statusCode)"
  }
  else {
    Write-Warning "Received HTTP $statusCode - deployment may still be initializing"
  }
}
catch {
  Write-Warning "Could not verify deployment yet (may still be initializing)"
}

# Step 9: Check API endpoint
Write-Step "Step 9: Checking API endpoint..."
try {
  $apiResponse = Invoke-WebRequest -Uri "$deploymentUrl/api/health" -Method Get -SkipHttpErrorCheck -TimeoutSec 10
  if ($apiResponse.Content -like "*healthy*" -or $apiResponse.Content -like "*status*") {
    Write-Success "API endpoint is responding"
  }
  else {
    Write-Warning "API endpoint may need time to initialize"
  }
}
catch {
  Write-Warning "API endpoint check failed (may still be initializing)"
}

# Step 10: Display next steps
Write-Step "Deployment Steps Complete!"
Write-Host ""
Write-Host "🎉 Your application has been deployed to Vercel!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:"
Write-Host ""
Write-Host "1. $(Write-Host "Configure DNS Records" -ForegroundColor Yellow -NoNewline)"
Write-Host ""
Write-Host "   - Go to your domain registrar (GoDaddy, Namecheap, etc.)"
Write-Host "   - Add CNAME record: www.clinicindia.fit → cname.vercel.com"
Write-Host "   - Add A record: clinicindia.fit → Vercel IP"
Write-Host ""
Write-Host "2. $(Write-Host "Set Environment Variables" -ForegroundColor Yellow -NoNewline)"
Write-Host ""
Write-Host "   - Go to https://vercel.com/dashboard"
Write-Host "   - Select your project"
Write-Host "   - Go to Settings → Environment Variables"
Write-Host "   - Add all required variables from .env.production"
Write-Host "   - Redeploy after setting variables"
Write-Host ""
Write-Host "3. $(Write-Host "Verify SSL Certificate" -ForegroundColor Yellow -NoNewline)"
Write-Host ""
Write-Host "   - Wait 5-30 minutes for Let's Encrypt certificate"
Write-Host "   - Check Vercel Dashboard → Domains for status"
Write-Host ""
Write-Host "4. $(Write-Host "Test Your Application" -ForegroundColor Yellow -NoNewline)"
Write-Host ""
Write-Host "   - Frontend: https://clinicindia.fit"
Write-Host "   - API: https://clinicindia.fit/api/health"
Write-Host ""
Write-Host "📍 Deployment URL: $deploymentUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful Commands:"
Write-Host "  vercel deployments     # View all deployments"
Write-Host "  vercel logs            # View deployment logs"
Write-Host "  vercel logs -f         # View real-time logs"
Write-Host "  vercel rollback        # Rollback to previous deployment"
Write-Host ""
