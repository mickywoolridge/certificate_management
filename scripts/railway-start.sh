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

max_attempts="${PRISMA_MIGRATE_MAX_ATTEMPTS:-12}"
retry_delay_seconds="${PRISMA_MIGRATE_RETRY_DELAY_SECONDS:-5}"
attempt=1

echo "Running prisma migrate deploy (up to ${max_attempts} attempts)..."
while true; do
  if npx prisma migrate deploy; then
    break
  fi

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Prisma migrations failed after ${max_attempts} attempts."
    case "$DATABASE_URL" in
      *postgres.railway.internal*)
        echo "DATABASE_URL uses Railway private networking."
        echo "Ensure this app and Postgres are in the same Railway environment and that DATABASE_URL is a service reference from that Postgres service."
        ;;
    esac
    exit 1
  fi

  echo "Migration attempt ${attempt}/${max_attempts} failed. Retrying in ${retry_delay_seconds}s..."
  attempt=$((attempt + 1))
  sleep "$retry_delay_seconds"
done

exec npm run start
