# Check Vercel CLI
Write-Host "Checking Vercel CLI..." -ForegroundColor Cyan
try {
  $vercelVersion = & vercel --version 2>$null
  Write-Host "Vercel CLI: $vercelVersion" -ForegroundColor Green
}
catch {
  Write-Host "Vercel CLI not found - install with: npm install -g vercel" -ForegroundColor Red
}

# Check login
Write-Host ""
Write-Host "Checking Vercel login status..." -ForegroundColor Cyan
try {
  $whoami = & vercel whoami 2>&1
  if ($whoami -like "*error*") {
    Write-Host "Not logged in - run: vercel login" -ForegroundColor Red
  } else {
    Write-Host "Logged in as: $whoami" -ForegroundColor Green
  }
}
catch {
  Write-Host "Not logged in - run: vercel login" -ForegroundColor Red
}

# Check frontend folder
Write-Host ""
Write-Host "Checking frontend folder..." -ForegroundColor Cyan
if (Test-Path "frontend/node_modules") {
  Write-Host "Dependencies installed" -ForegroundColor Green
} else {
  Write-Host "Dependencies NOT installed - run: cd frontend; npm install" -ForegroundColor Red
}

# Check DNS
Write-Host ""
Write-Host "Checking DNS..." -ForegroundColor Cyan
try {
  $dns = [System.Net.Dns]::GetHostAddresses("clinicindia.fit") 2>$null
  if ($dns) {
    Write-Host "Domain resolves to: $($dns.IPAddressToString)" -ForegroundColor Green
  } else {
    Write-Host "Domain not resolving yet" -ForegroundColor Yellow
  }
}
catch {
  Write-Host "Domain not resolving yet - wait for DNS propagation" -ForegroundColor Yellow
}

# Check site access
Write-Host ""
Write-Host "Checking site access..." -ForegroundColor Cyan
try {
  $response = Invoke-WebRequest -Uri "https://clinicindia.fit" -Method Get -SkipHttpErrorCheck -TimeoutSec 5 2>$null
  if ($response.StatusCode -eq 200) {
    Write-Host "Site is accessible" -ForegroundColor Green
  } else {
    Write-Host "Site returned HTTP $($response.StatusCode)" -ForegroundColor Yellow
  }
}
catch {
  Write-Host "Site not accessible yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor White
Write-Host "1. cd frontend" -ForegroundColor Yellow
Write-Host "2. npm install" -ForegroundColor Yellow
Write-Host "3. cd .." -ForegroundColor Yellow
Write-Host "4. vercel login" -ForegroundColor Yellow
Write-Host "5. cd frontend" -ForegroundColor Yellow
Write-Host "6. vercel --prod" -ForegroundColor Yellow
