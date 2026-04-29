/**
 * Copy ObjectType + Certificate rows from SOURCE_DATABASE_URL to TARGET_DATABASE_URL.
 * Truncates target data first (same tables). Use Railway public proxy URLs from each environment.
 *
 * Example:
 *   SOURCE_DATABASE_URL="$(railway variables --service Postgres --environment production --json | jq -r '.DATABASE_PUBLIC_URL')" \
 *   TARGET_DATABASE_URL="$(railway variables --service Postgres --environment certificate_management-pr-4 --json | jq -r '.DATABASE_PUBLIC_URL')" \
 *   npx tsx scripts/copy-env-db-data.ts
 */
import { PrismaClient } from "@prisma/client";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;

if (!sourceUrl?.trim() || !targetUrl?.trim()) {
  console.error("Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL (non-empty).");
  process.exit(1);
}

if (sourceUrl === targetUrl) {
  console.error("SOURCE and TARGET must differ.");
  process.exit(1);
}

const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });

async function main() {
  const [objectTypes, certificates] = await Promise.all([
    source.objectType.findMany({ orderBy: { name: "asc" } }),
    source.certificate.findMany({ orderBy: { endDate: "asc" } }),
  ]);

  console.log(`Source: ${objectTypes.length} object types, ${certificates.length} certificates.`);

  await target.$transaction(async (tx) => {
    await tx.certificate.deleteMany();
    await tx.objectType.deleteMany();
  });

  if (objectTypes.length > 0) {
    await target.objectType.createMany({ data: objectTypes });
  }
  if (certificates.length > 0) {
    await target.certificate.createMany({ data: certificates });
  }

  const [tTypes, tCerts] = await Promise.all([
    target.objectType.count(),
    target.certificate.count(),
  ]);
  console.log(`Target after copy: ${tTypes} object types, ${tCerts} certificates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
