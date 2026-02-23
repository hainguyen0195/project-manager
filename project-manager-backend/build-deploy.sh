#!/bin/bash
# Build & Deploy Script for Project Manager
# Gộp React frontend vào Laravel backend

echo "========================================"
echo "  Build Project Manager for Deployment"
echo "========================================"
echo ""

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(dirname "$BACKEND_DIR")/project-manager-frontend"
BUILD_OUTPUT="$BACKEND_DIR/public/app"

# Step 1: Build React
echo "[1/4] Building React frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "  Installing npm dependencies..."
    npm install
fi

npm run build

if [ $? -ne 0 ]; then
    echo "React build FAILED!"
    exit 1
fi

echo "  React build completed!"

# Step 2: Copy build to Laravel public/app
echo "[2/4] Copying build files to Laravel..."

if [ -d "$BUILD_OUTPUT" ]; then
    rm -rf "$BUILD_OUTPUT"
fi

cp -r "$FRONTEND_DIR/build" "$BUILD_OUTPUT"
echo "  Files copied to public/app/"

# Step 3: Laravel optimizations
echo "[3/4] Optimizing Laravel..."
cd "$BACKEND_DIR"

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "  Laravel optimized!"

# Step 4: Create storage link
echo "[4/4] Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo ""
echo "========================================"
echo "  Build completed successfully!"
echo "========================================"
echo ""
echo "Deploy instructions:"
echo "  1. Upload the entire 'project-manager-backend' folder to hosting"
echo "  2. Point document root to 'public' folder"
echo "  3. Configure .env for production (database, APP_URL, etc.)"
echo "  4. Run: php artisan migrate"
echo "  5. Run: php artisan storage:link"
echo ""

cd "$BACKEND_DIR"
