import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInNoticePeriod } from "@/lib/notice";
import { sendNoticeEntryEmail } from "@/lib/notify";

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
    where: { noticeEntryNotifiedAt: null },
  });

  const now = new Date();
  const results: { id: string; status: string }[] = [];

  for (const cert of certs) {
    if (!isInNoticePeriod(cert, now)) {
      continue;
    }
    if (now > cert.endDate) {
      continue;
    }

    const send = await sendNoticeEntryEmail(cert, appUrl);
    if (!send.ok) {
      results.push({ id: cert.id, status: `email_failed: ${send.error}` });
      continue;
    }

    await prisma.certificate.update({
      where: { id: cert.id },
      data: { noticeEntryNotifiedAt: now },
    });
    results.push({ id: cert.id, status: "notified" });
  }

  return NextResponse.json({
    checked: certs.length,
    notified: results.filter((r) => r.status === "notified").length,
    results,
  });
}
