/**
 * Inserts demo certificates in the notice window so dashboard chips differ:
 * "X in notice · Y notified" (Y uses noticeEntryNotifiedAt).
 *
 * Idempotent: removes prior rows whose name starts with "[Demo notify-proof]".
 *
 *   DATABASE_URL="$(railway variables --service Postgres --environment certificate_management-pr-4 --json | jq -r '.DATABASE_PUBLIC_URL')" \
 *   npx tsx scripts/seed-notification-proof.ts
 */
import { NoticeUnit, PrismaClient } from "@prisma/client";
import { isInNoticePeriod } from "../src/lib/notice";

const prisma = new PrismaClient();

const DEMO_PREFIX = "[Demo notify-proof]";

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

async function main() {
  const types = await prisma.objectType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 4,
  });
  if (types.length < 2) {
    console.error("Need at least 2 active object types in the database.");
    process.exit(1);
  }

  await prisma.certificate.deleteMany({
    where: { name: { startsWith: DEMO_PREFIX } },
  });

  const now = new Date();
  now.setUTCHours(12, 0, 0, 0);
  const notifiedYesterday = addDays(now, -1);

  const rows: Array<{
    objectTypeId: string;
    system: string;
    name: string;
    startDate: Date;
    endDate: Date;
    description: string;
    ownerName: string;
    ownerEmail: string;
    noticeQuantity: number;
    noticeUnit: NoticeUnit;
    noticeEntryNotifiedAt: Date | null;
  }> = [];

  const t0 = types[0]!;
  const t1 = types[1]!;
  const t2 = types[2] ?? t0;

  // Type 0: 2 in notice, 1 notified, 1 pending
  rows.push(
    {
      objectTypeId: t0.id,
      system: `demo-notify-pending.${t0.slug}.example`,
      name: `${DEMO_PREFIX} ${t0.name} — pending email`,
      startDate: addDays(now, -120),
      endDate: addDays(now, 6),
      description: "In 30-day notice window; owner has not been emailed yet (noticeEntryNotifiedAt null).",
      ownerName: "Demo Owner Pending",
      ownerEmail: "demo-pending@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      noticeEntryNotifiedAt: null,
    },
    {
      objectTypeId: t0.id,
      system: `demo-notify-sent.${t0.slug}.example`,
      name: `${DEMO_PREFIX} ${t0.name} — owner notified`,
      startDate: addDays(now, -100),
      endDate: addDays(now, 10),
      description: "In notice window; simulates cron having set noticeEntryNotifiedAt.",
      ownerName: "Demo Owner Notified",
      ownerEmail: "demo-notified@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      noticeEntryNotifiedAt: notifiedYesterday,
    },
  );

  // Type 1: 2 in notice, both notified (so "notified" can equal "in notice" for one type)
  rows.push(
    {
      objectTypeId: t1.id,
      system: `demo-notify-sent-a.${t1.slug}.example`,
      name: `${DEMO_PREFIX} ${t1.name} — notified A`,
      startDate: addDays(now, -90),
      endDate: addDays(now, 14),
      description: "In notice window; notified.",
      ownerName: "Demo Notified A",
      ownerEmail: "demo-na@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      noticeEntryNotifiedAt: notifiedYesterday,
    },
    {
      objectTypeId: t1.id,
      system: `demo-notify-sent-b.${t1.slug}.example`,
      name: `${DEMO_PREFIX} ${t1.name} — notified B`,
      startDate: addDays(now, -80),
      endDate: addDays(now, 20),
      description: "In notice window; notified.",
      ownerName: "Demo Notified B",
      ownerEmail: "demo-nb@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      noticeEntryNotifiedAt: notifiedYesterday,
    },
  );

  // Type 2 (or repeat): 1 in notice, pending — spreads "pending" across another type
  rows.push({
    objectTypeId: t2.id,
    system: `demo-notify-pending-2.${t2.slug}.example`,
    name: `${DEMO_PREFIX} ${t2.name} — pending only`,
    startDate: addDays(now, -200),
    endDate: addDays(now, 5),
    description: "Second object type with only a pending notify row.",
    ownerName: "Demo Owner Pending 2",
    ownerEmail: "demo-pending2@example.com",
    noticeQuantity: 30,
    noticeUnit: NoticeUnit.DAYS,
    noticeEntryNotifiedAt: null,
  });

  await prisma.certificate.createMany({ data: rows });

  const verify = await prisma.certificate.findMany({
    where: { name: { startsWith: DEMO_PREFIX } },
    include: { objectType: true },
  });

  const inWindow = verify.filter((c) => isInNoticePeriod(c, now));
  const notified = inWindow.filter((c) => c.noticeEntryNotifiedAt != null).length;

  console.log(`Inserted ${rows.length} demo rows (${inWindow.length} in notice window right now).`);
  console.log(`Among those, ${notified} have noticeEntryNotifiedAt set (shown as "notified" on dashboard).`);

  const byType = new Map<string, { inNotice: number; notified: number }>();
  for (const c of inWindow) {
    const n = c.objectType.name;
    const cur = byType.get(n) ?? { inNotice: 0, notified: 0 };
    cur.inNotice += 1;
    if (c.noticeEntryNotifiedAt) cur.notified += 1;
    byType.set(n, cur);
  }
  console.log("Demo-only contribution by object type (dashboard chips also include any other in-window rows):");
  for (const [name, v] of Array.from(byType.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${name}: ${v.inNotice} in notice · ${v.notified} notified`);
  }
  console.log(`In the table, find names starting with "${DEMO_PREFIX}" — Owner notified shows Pending vs Yes + date.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
