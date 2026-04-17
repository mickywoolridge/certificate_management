#!/usr/bin/env sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set."
  echo "In Railway: add a PostgreSQL database, open this service → Variables → add DATABASE_URL (reference the Postgres service URL)."
  exit 1
fi

npx prisma migrate deploy
exec npm run start
