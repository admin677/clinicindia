# Verify Vercel Deployment Status

Write-Host "🔍 Vercel Deployment Diagnostic Check" -ForegroundColor Cyan
Write-Host ""

# Check 1: Vercel CLI installed
Write-Host "1️⃣  Checking Vercel CLI..." -ForegroundColor Yellow
try {
  $vercelVersion = & vercel --version
  Write-Host "✅ Vercel CLI: $vercelVersion" -ForegroundColor Green
}
catch {
  Write-Host "❌ Vercel CLI not installed" -ForegroundColor Red
  Write-Host "   Install with: npm install -g vercel" -ForegroundColor Yellow
}

# Check 2: Vercel login status
Write-Host ""
Write-Host "2️⃣  Checking Vercel login status..." -ForegroundColor Yellow
try {
  $whoami = & vercel whoami 2>&1
  if ($whoami -like "*error*" -or $whoami -like "*not logged*") {
    Write-Host "❌ Not logged into Vercel" -ForegroundColor Red
    Write-Host "   Login with: vercel login" -ForegroundColor Yellow
  }
  else {
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
  }
}
catch {
  Write-Host "❌ Not logged into Vercel" -ForegroundColor Red
  Write-Host "   Login with: vercel login" -ForegroundColor Yellow
}

# Check 3: Frontend dependencies
Write-Host ""
Write-Host "3️⃣  Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
  Write-Host "✅ Dependencies installed" -ForegroundColor Green
}
else {
  Write-Host "❌ Dependencies not installed" -ForegroundColor Red
  Write-Host "   Run: cd frontend; npm install" -ForegroundColor Yellow
}

# Check 4: Environment file
Write-Host ""
Write-Host "4️⃣  Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/.env.local") {
  Write-Host "✅ .env.local exists" -ForegroundColor Green
  $envContent = Get-Content "frontend/.env.local" -Raw
  if ($envContent -like "*DATABASE_URL*") {
    Write-Host "   ✓ DATABASE_URL configured" -ForegroundColor Green
  }
  else {
    Write-Host "   ⚠️  DATABASE_URL not found" -ForegroundColor Yellow
  }
}
else {
  Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
  Write-Host "   Copy: cp frontend/.env.local.example frontend/.env.local" -ForegroundColor Yellow
}

# Check 5: Domain DNS
Write-Host ""
Write-Host "5️⃣  Checking domain DNS..." -ForegroundColor Yellow
try {
  $nslookup = & nslookup clinicindia.fit
  if ($nslookup -like "*76.76.*") {
    Write-Host "✅ DNS pointing to Vercel (76.76.x.x)" -ForegroundColor Green
  }
  elseif ($nslookup -like "*Non-authoritative answer*") {
    Write-Host "⚠️  DNS exists but checking which provider..." -ForegroundColor Yellow
    Write-Host $nslookup -ForegroundColor Gray
  }
  else {
    Write-Host "❌ DNS not configured yet" -ForegroundColor Red
    Write-Host "   Update DNS at your registrar:" -ForegroundColor Yellow
    Write-Host "   - www.clinicindia.fit CNAME → cname.vercel.com" -ForegroundColor Yellow
    Write-Host "   - clinicindia.fit A → [Vercel IP from dashboard]" -ForegroundColor Yellow
  }
}
catch {
  Write-Host "❌ Domain lookup failed" -ForegroundColor Red
  Write-Host "   Domain may not be registered or DNS not configured" -ForegroundColor Yellow
}

# Check 6: Test site accessibility
Write-Host ""
Write-Host "6️⃣  Testing site accessibility..." -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "https://clinicindia.fit" -Method Get -SkipHttpErrorCheck -TimeoutSec 5
  Write-Host "✅ Site is loading (HTTP $($response.StatusCode))" -ForegroundColor Green
}
catch {
  Write-Host "❌ Cannot reach https://clinicindia.fit" -ForegroundColor Red
  Write-Host "   This could mean:" -ForegroundColor Yellow
  Write-Host "   - DNS not yet propagated (wait 5-48 hours)" -ForegroundColor Yellow
  Write-Host "   - Site not deployed to Vercel yet" -ForegroundColor Yellow
  Write-Host "   - SSL certificate not yet issued" -ForegroundColor Yellow
}

# Check 7: Test API
Write-Host ""
Write-Host "7️⃣  Testing API endpoint..." -ForegroundColor Yellow
try {
  $apiResponse = Invoke-WebRequest -Uri "https://clinicindia.fit/api/health" -Method Get -SkipHttpErrorCheck -TimeoutSec 5
  if ($apiResponse.StatusCode -eq 200) {
    Write-Host "✅ API is responding" -ForegroundColor Green
    Write-Host $apiResponse.Content -ForegroundColor Gray
  }
  else {
    Write-Host "⚠️  API responded with code $($apiResponse.StatusCode)" -ForegroundColor Yellow
  }
}
catch {
  Write-Host "❌ API not accessible yet" -ForegroundColor Red
}

# Check 8: Vercel project link
Write-Host ""
Write-Host "8️⃣  Checking Vercel project link..." -ForegroundColor Yellow
if (Test-Path "frontend/.vercel/project.json") {
  Write-Host "✅ Project linked to Vercel" -ForegroundColor Green
}
else {
  Write-Host "❌ Project not linked to Vercel" -ForegroundColor Red
  Write-Host "   Link with: cd frontend && vercel link" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get your site LIVE:" -ForegroundColor White
Write-Host ""
Write-Host "1. Install dependencies:"
Write-Host "   cd frontend; npm install" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Login to Vercel:"
Write-Host "   vercel login" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Deploy:"
Write-Host "   cd frontend; vercel --prod" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Configure DNS at your registrar (clinicindia.fit)" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Wait for DNS to propagate" -ForegroundColor Yellow
Write-Host ""
Write-Host "6. Check status:"
Write-Host "   nslookup clinicindia.fit" -ForegroundColor Yellow
Write-Host ""
Write-Host "═════════════════════════════════════════════════════" -ForegroundColor Cyan
