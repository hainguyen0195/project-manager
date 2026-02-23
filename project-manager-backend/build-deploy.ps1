# Build & Deploy Script for Project Manager
# Gộp React frontend vào Laravel backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Project Manager for Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = $PSScriptRoot
$frontendDir = Join-Path (Split-Path $backendDir -Parent) "project-manager-frontend"
$buildOutput = Join-Path $backendDir "public\app"

# Step 1: Build React
Write-Host "[1/4] Building React frontend..." -ForegroundColor Yellow
Set-Location $frontendDir

if (!(Test-Path "node_modules")) {
    Write-Host "  Installing npm dependencies..." -ForegroundColor Gray
    npm install
}

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "React build FAILED!" -ForegroundColor Red
    exit 1
}

Write-Host "  React build completed!" -ForegroundColor Green

# Step 2: Copy build to Laravel public/app
Write-Host "[2/4] Copying build files to Laravel..." -ForegroundColor Yellow

if (Test-Path $buildOutput) {
    Remove-Item $buildOutput -Recurse -Force
}

Copy-Item -Path (Join-Path $frontendDir "build") -Destination $buildOutput -Recurse
Write-Host "  Files copied to public/app/" -ForegroundColor Green

# Step 3: Laravel optimizations
Write-Host "[3/4] Optimizing Laravel..." -ForegroundColor Yellow
Set-Location $backendDir

php artisan config:cache
php artisan route:cache
php artisan view:cache

Write-Host "  Laravel optimized!" -ForegroundColor Green

# Step 4: Create storage link
Write-Host "[4/4] Creating storage link..." -ForegroundColor Yellow
php artisan storage:link 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Build completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Deploy instructions:" -ForegroundColor Cyan
Write-Host "  1. Upload the entire 'project-manager-backend' folder to hosting"
Write-Host "  2. Point document root to 'public' folder"
Write-Host "  3. Configure .env for production (database, APP_URL, etc.)"
Write-Host "  4. Run: php artisan migrate"
Write-Host "  5. Run: php artisan storage:link"
Write-Host ""

Set-Location $backendDir
