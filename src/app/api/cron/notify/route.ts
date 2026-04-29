import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInNoticePeriod, isSameUtcCalendarDay } from "@/lib/notice";
import { sendNoticeReminderEmail } from "@/lib/notify";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (token !== secret && headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const certs = await prisma.certificate.findMany({
    include: { objectType: true },
  });

  const now = new Date();
  const results: { id: string; status: string }[] = [];
  let skippedOutsideWindow = 0;
  let skippedAlreadyToday = 0;

  for (const cert of certs) {
    if (!isInNoticePeriod(cert, now)) {
      skippedOutsideWindow += 1;
      continue;
    }
    if (cert.lastNotifiedAt && isSameUtcCalendarDay(cert.lastNotifiedAt, now)) {
      skippedAlreadyToday += 1;
      continue;
    }

    const nextCount = cert.notificationCount + 1;
    const send = await sendNoticeReminderEmail(cert, appUrl, nextCount);
    if (!send.ok) {
      results.push({ id: cert.id, status: `email_failed: ${send.error}` });
      continue;
    }

    await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        notificationCount: { increment: 1 },
        lastNotifiedAt: now,
      },
    });
    results.push({ id: cert.id, status: "notified" });
  }

  return NextResponse.json({
    candidates: certs.length,
    skippedOutsideWindow,
    skippedAlreadyToday,
    sent: results.filter((r) => r.status === "notified").length,
    failed: results.filter((r) => r.status.startsWith("email_failed")).length,
    results,
  });
}
