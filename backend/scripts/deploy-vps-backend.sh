#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/9] Cleaning build and Prisma generated client"
rm -rf dist
rm -f tsconfig.tsbuildinfo
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

echo "[2/9] Installing dependencies"
npm ci

echo "[3/9] Regenerating Prisma client"
npx prisma generate

echo "[4/9] Verifying Prisma client types"
node ./scripts/verify-prisma-client.js

echo "[5/9] Aplicando migraciones de base de datos"
npx prisma migrate deploy

echo "[6/9] Building backend"
npm run build

echo "[7/9] Verifying compiled declaration output"
if ! grep -n "onboardingData" dist/src/projects/projects.service.d.ts >/dev/null 2>&1; then
  echo "No se encontro onboardingData en dist/src/projects/projects.service.d.ts"
  exit 1
fi

if grep -n "onboardingData: string | null" dist/src/projects/projects.service.d.ts >/dev/null 2>&1; then
  echo "dist sigue compilado con onboardingData string|null"
  exit 1
fi

echo "[8/9] Restarting PM2"
pm2 restart plia-backend --update-env

echo "[9/9] Done"
pm2 status plia-backend
