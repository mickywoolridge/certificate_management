/**
 * Inserts demo certificates in the notice window with varied notificationCount / lastNotifiedAt
 * so the dashboard shows per-row counts and type-level sums.
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
  const notifiedThreeDaysAgo = addDays(now, -3);

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
    notificationCount: number;
    lastNotifiedAt: Date | null;
  }> = [];

  const t0 = types[0]!;
  const t1 = types[1]!;
  const t2 = types[2] ?? t0;

  rows.push(
    {
      objectTypeId: t0.id,
      system: `demo-notify-zero.${t0.slug}.example`,
      name: `${DEMO_PREFIX} ${t0.name} — 0 sends`,
      startDate: addDays(now, -120),
      endDate: addDays(now, 6),
      description: "In notice window; cron has not sent yet (count 0).",
      ownerName: "Demo Owner Zero",
      ownerEmail: "demo-zero@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      notificationCount: 0,
      lastNotifiedAt: null,
    },
    {
      objectTypeId: t0.id,
      system: `demo-notify-multi.${t0.slug}.example`,
      name: `${DEMO_PREFIX} ${t0.name} — 5 sends`,
      startDate: addDays(now, -100),
      endDate: addDays(now, 10),
      description: "Simulates five successful daily reminders while in window.",
      ownerName: "Demo Owner Multi",
      ownerEmail: "demo-multi@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      notificationCount: 5,
      lastNotifiedAt: notifiedYesterday,
    },
  );

  rows.push(
    {
      objectTypeId: t1.id,
      system: `demo-notify-three.${t1.slug}.example`,
      name: `${DEMO_PREFIX} ${t1.name} — 3 sends`,
      startDate: addDays(now, -90),
      endDate: addDays(now, 14),
      description: "Three reminders logged.",
      ownerName: "Demo Three",
      ownerEmail: "demo-three@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      notificationCount: 3,
      lastNotifiedAt: notifiedThreeDaysAgo,
    },
    {
      objectTypeId: t1.id,
      system: `demo-notify-one.${t1.slug}.example`,
      name: `${DEMO_PREFIX} ${t1.name} — 1 send`,
      startDate: addDays(now, -80),
      endDate: addDays(now, 20),
      description: "Single first-day reminder.",
      ownerName: "Demo One",
      ownerEmail: "demo-one@example.com",
      noticeQuantity: 30,
      noticeUnit: NoticeUnit.DAYS,
      notificationCount: 1,
      lastNotifiedAt: notifiedYesterday,
    },
  );

  rows.push({
    objectTypeId: t2.id,
    system: `demo-notify-twelve.${t2.slug}.example`,
    name: `${DEMO_PREFIX} ${t2.name} — 12 sends`,
    startDate: addDays(now, -200),
    endDate: addDays(now, 5),
    description: "High count to stand out in the Notifications column.",
    ownerName: "Demo Twelve",
    ownerEmail: "demo-twelve@example.com",
    noticeQuantity: 30,
    noticeUnit: NoticeUnit.DAYS,
    notificationCount: 12,
    lastNotifiedAt: notifiedYesterday,
  });

  await prisma.certificate.createMany({ data: rows });

  const verify = await prisma.certificate.findMany({
    where: { name: { startsWith: DEMO_PREFIX } },
    include: { objectType: true },
  });

  const inWindow = verify.filter((c) => isInNoticePeriod(c, now));
  const sumCounts = inWindow.reduce((s, c) => s + c.notificationCount, 0);

  console.log(`Inserted ${rows.length} demo rows (${inWindow.length} in notice window right now).`);
  console.log(`Sum of notificationCount across demo rows in window: ${sumCounts}.`);

  const byType = new Map<string, { inNotice: number; notificationSum: number }>();
  for (const c of inWindow) {
    const n = c.objectType.name;
    const cur = byType.get(n) ?? { inNotice: 0, notificationSum: 0 };
    cur.inNotice += 1;
    cur.notificationSum += c.notificationCount;
    byType.set(n, cur);
  }
  console.log("Demo-only contribution by object type (dashboard also includes other in-window rows):");
  for (const [name, v] of Array.from(byType.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${name}: ${v.inNotice} in notice · ${v.notificationSum} notifications (sum of counts)`);
  }
  console.log(`In the table, find names starting with "${DEMO_PREFIX}" — Notifications column shows count + last sent date.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
