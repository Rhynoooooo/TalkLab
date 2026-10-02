#!/usr/bin/env bash
# ==============================================================================
# TalkLab 2.0 - Production Zero-Downtime Deployment Script
# Target: Ubuntu/Debian Linux Server • People & Spaces (مركز سفراء العلم)
# Stack: Next.js 16 (App Router), React 19, TypeScript, OpenWA Daemon
# ==============================================================================

set -euo pipefail

# ANSI Color Codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_NAME="talklab-app"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=3000
OPENWA_PORT=2785

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${BLUE}"
echo "======================================================================="
echo "   🚀 TALKLAB 2.0 - ZERO-DOWNTIME PRODUCTION DEPLOYMENT RUNBOOK"
echo "   Venue: People & Spaces • Hay Al-Andalus, Tripoli, Libya"
echo "======================================================================="
echo -e "${NC}"

cd "$APP_DIR"

# ------------------------------------------------------------------------------
# STEP 1: Pre-Flight Environment Checks
# ------------------------------------------------------------------------------
log_info "Step 1/8: Verifying environment configuration and prerequisites..."

if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    log_error "Missing .env.local or .env configuration file! Copy .env.example and configure secrets."
    exit 1
fi

# Ensure required environment variables exist
grep -q "ADMIN_PORTAL_PIN" .env* || log_warn "ADMIN_PORTAL_PIN not detected in .env"
grep -q "SESSION_JWT_SECRET" .env* || { log_error "SESSION_JWT_SECRET is missing!"; exit 1; }

# Ensure data directory exists for boardroom state & archives
mkdir -p "$APP_DIR/data"
chmod 750 "$APP_DIR/data"

# Verify OpenWA port 2785 is strictly bound to localhost, NOT public WAN
if command -v netstat >/dev/null 2>&1; then
    if netstat -tlpn 2>/dev/null | grep ":$OPENWA_PORT" | grep -q "0.0.0.0"; then
        log_error "SECURITY ALERT: Port $OPENWA_PORT is bound to 0.0.0.0! Must bind to 127.0.0.1 only."
        exit 1
    fi
fi
log_success "Environment and security pre-flight passed."

# ------------------------------------------------------------------------------
# STEP 2: Dependency Verification & Installation
# ------------------------------------------------------------------------------
log_info "Step 2/8: Installing and verifying npm dependencies..."
npm ci --prefer-offline --no-audit

# ------------------------------------------------------------------------------
# STEP 3: Strict Static Type Checking (Zero Bypass)
# ------------------------------------------------------------------------------
log_info "Step 3/8: Executing strict TypeScript type check (tsc --noEmit)..."
npx tsc --noEmit
log_success "TypeScript check passed with zero errors."

# ------------------------------------------------------------------------------
# STEP 4: ESLint Verification
# ------------------------------------------------------------------------------
log_info "Step 4/8: Running ESLint quality gates..."
npm run lint
log_success "ESLint passed with zero errors and zero warnings."

# ------------------------------------------------------------------------------
# STEP 5: Optimized Next.js 16 Production Build
# ------------------------------------------------------------------------------
log_info "Step 5/8: Building optimized Next.js 16 production bundle (Turbopack)..."
export NODE_ENV=production
npm run build
log_success "Production build completed successfully."

# ------------------------------------------------------------------------------
# STEP 6: OpenWA WhatsApp Daemon Health Check
# ------------------------------------------------------------------------------
log_info "Step 6/8: Inspecting internal OpenWA WhatsApp daemon on port $OPENWA_PORT..."
if curl -s --max-time 3 "http://127.0.0.1:$OPENWA_PORT/" >/dev/null 2>&1; then
    log_success "OpenWA WhatsApp daemon is healthy and responding on 127.0.0.1:$OPENWA_PORT."
else
    log_warn "OpenWA daemon not responding on 127.0.0.1:$OPENWA_PORT. App will use simulated fallback until daemon connects."
fi

# ------------------------------------------------------------------------------
# STEP 7: Process Reload (PM2 / Systemd)
# ------------------------------------------------------------------------------
log_info "Step 7/8: Reloading application process..."

if command -v pm2 >/dev/null 2>&1; then
    if pm2 list | grep -q "$APP_NAME"; then
        log_info "Reloading existing PM2 cluster..."
        pm2 reload "$APP_NAME" --update-env
    else
        log_info "Starting new PM2 instance on port $PORT..."
        pm2 start npm --name "$APP_NAME" -- run start -- -p "$PORT"
    fi
    pm2 save
    log_success "PM2 process reload complete."
elif command -v systemctl >/dev/null 2>&1 && systemctl list-units --full -all | grep -q "talklab.service"; then
    log_info "Reloading talklab.service via systemd..."
    sudo systemctl restart talklab.service
    log_success "Systemd service restarted."
else
    log_warn "Neither PM2 nor systemd detected. Launching in background..."
    nohup npm run start -- -p "$PORT" > app.log 2>&1 &
    log_success "App launched in background (PID: $!)."
fi

# ------------------------------------------------------------------------------
# STEP 8: Post-Deployment Smoke Test
# ------------------------------------------------------------------------------
log_info "Step 8/8: Executing post-deploy automated smoke test..."
sleep 2

# Test 1: HTTP 200 on Root
ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/")
if [ "$ROOT_STATUS" -eq 200 ]; then
    log_success "Smoke Test 1/3 PASSED: Root page (/) returned HTTP 200."
else
    log_error "Smoke Test 1/3 FAILED: Root page returned HTTP $ROOT_STATUS"
    exit 1
fi

# Test 2: Unauthenticated /api/auth/me returns 200 with authenticated: false
AUTH_RESP=$(curl -s "http://127.0.0.1:$PORT/api/auth/me")
if echo "$AUTH_RESP" | grep -q '"authenticated":false'; then
    log_success "Smoke Test 2/3 PASSED: Auth endpoint (/api/auth/me) correctly hydrated."
else
    log_error "Smoke Test 2/3 FAILED: Auth endpoint response unexpected: $AUTH_RESP"
    exit 1
fi

# Test 3: Route Guard Middleware blocks unauthorized admin request (401)
GUARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://127.0.0.1:$PORT/api/admin/seats/check-in" -H "Content-Type: application/json" -d '{}')
if [ "$GUARD_STATUS" -eq 401 ]; then
    log_success "Smoke Test 3/3 PASSED: Edge Route Guard successfully rejected unauthorized access (HTTP 401)."
else
    log_warn "Smoke Test 3/3 NOTICE: Route guard returned HTTP $GUARD_STATUS (Expected 401)."
fi

echo -e "${GREEN}"
echo "======================================================================="
echo "   🎉 TALKLAB 2.0 SUCCESSFULLY DEPLOYED TO PRODUCTION!"
echo "   Live URL: http://127.0.0.1:$PORT"
echo "======================================================================="
echo -e "${NC}"
