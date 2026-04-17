#!/usr/bin/env bash
# Creates role + database on your local PostgreSQL (port 5432).
# Requires: sudo -u postgres (you will be prompted for your sudo password).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PASS="$(openssl rand -hex 16)"

echo "Resetting dev DB certificate_management_local if it exists (local dev only) …"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<EOSQL
DROP DATABASE IF EXISTS certificate_management_local WITH (FORCE);
DROP ROLE IF EXISTS certificate_management_app;
CREATE ROLE certificate_management_app LOGIN PASSWORD '${PASS}';
CREATE DATABASE certificate_management_local OWNER certificate_management_app;
EOSQL

cat > .env <<EOF
DATABASE_URL="postgresql://certificate_management_app:${PASS}@localhost:5432/certificate_management_local"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="local-dev-cron-secret"
EOF

echo "Wrote .env with DATABASE_URL. Next: npm run db:migrate && npm run dev"
