#!/usr/bin/env sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set."
  echo "In Railway: add a PostgreSQL database, open this service → Variables → add DATABASE_URL (reference the Postgres service URL)."
  exit 1
fi

# Catch the common mistake: pasting a local .env URL into Railway (Prisma would try localhost:5432).
case "$DATABASE_URL" in
  *localhost*|*127.0.0.1*)
    echo "DATABASE_URL points at this machine (localhost / 127.0.0.1), not Railway Postgres."
    echo "In Railway: add the Postgres plugin if needed, open the Postgres service → Variables → copy DATABASE_URL into this app’s Variables (or use a reference from the Postgres service so it stays in sync)."
    echo "Remove any manual DATABASE_URL that was copied from local development."
    exit 1
    ;;
esac

npx prisma migrate deploy
exec npm run start
