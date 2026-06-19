#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Instalando dependencias"
npm ci

echo "[2/4] Compilando Next.js"
npm run build

echo "[3/4] Reiniciando PM2"
if pm2 describe plia-frontend > /dev/null 2>&1; then
  pm2 restart plia-frontend --update-env
else
  pm2 start npm --name plia-frontend -- start
fi

echo "[4/4] Listo"
pm2 status plia-frontend
