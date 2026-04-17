import { NextResponse } from "next/server";
import { NoticeUnit } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isInNoticePeriod } from "@/lib/notice";

function parseNoticeUnit(v: unknown): NoticeUnit | null {
  if (v === "DAYS" || v === "WEEKS" || v === "MONTHS") return v;
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dashboard = searchParams.get("dashboard") === "1";

  const rows = await prisma.certificate.findMany({
    orderBy: { endDate: "asc" },
  });

  const now = new Date();
  const filtered = dashboard ? rows.filter((c) => isInNoticePeriod(c, now)) : rows;

  return NextResponse.json({ certificates: filtered });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const system = typeof body.system === "string" ? body.system.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const ownerName = typeof body.ownerName === "string" ? body.ownerName.trim() : "";
  const ownerEmail = typeof body.ownerEmail === "string" ? body.ownerEmail.trim() : "";
  const description =
    typeof body.description === "string" && body.description.trim() ? body.description.trim() : null;

  const noticeQuantity = Number(body.noticeQuantity);
  const noticeUnit = parseNoticeUnit(body.noticeUnit);

  const startDate = body.startDate ? new Date(String(body.startDate)) : null;
  const endDate = body.endDate ? new Date(String(body.endDate)) : null;

  if (!system || !name || !ownerName || !ownerEmail) {
    return NextResponse.json({ error: "system, name, ownerName, and ownerEmail are required" }, { status: 400 });
  }
  if (!startDate || Number.isNaN(startDate.getTime()) || !endDate || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Valid startDate and endDate are required" }, { status: 400 });
  }
  if (endDate <= startDate) {
    return NextResponse.json({ error: "endDate must be after startDate" }, { status: 400 });
  }
  if (!Number.isInteger(noticeQuantity) || noticeQuantity < 1) {
    return NextResponse.json({ error: "noticeQuantity must be a positive integer" }, { status: 400 });
  }
  if (!noticeUnit) {
    return NextResponse.json({ error: "noticeUnit must be DAYS, WEEKS, or MONTHS" }, { status: 400 });
  }

  const cert = await prisma.certificate.create({
    data: {
      system,
      name,
      startDate,
      endDate,
      description,
      ownerName,
      ownerEmail,
      noticeQuantity,
      noticeUnit,
    },
  });

  return NextResponse.json({ certificate: cert }, { status: 201 });
}
