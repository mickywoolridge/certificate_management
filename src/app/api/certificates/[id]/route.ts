import { NextResponse } from "next/server";
import { NoticeUnit } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseNoticeUnit(v: unknown): NoticeUnit | null {
  if (v === "DAYS" || v === "WEEKS" || v === "MONTHS") return v;
  return null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ certificate: cert });
}

export async function PATCH(request: Request, context: Ctx) {
  const { id } = await context.params;
  const existing = await prisma.certificate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: Parameters<typeof prisma.certificate.update>[0]["data"] = {};

  if (typeof body.system === "string") data.system = body.system.trim();
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.ownerName === "string") data.ownerName = body.ownerName.trim();
  if (typeof body.ownerEmail === "string") data.ownerEmail = body.ownerEmail.trim();

  if (body.description !== undefined) {
    data.description =
      typeof body.description === "string" && body.description.trim()
        ? String(body.description).trim()
        : null;
  }

  if (body.startDate !== undefined) {
    const d = new Date(String(body.startDate));
    if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
    data.startDate = d;
  }
  if (body.endDate !== undefined) {
    const d = new Date(String(body.endDate));
    if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid endDate" }, { status: 400 });
    data.endDate = d;
  }

  if (body.noticeQuantity !== undefined) {
    const n = Number(body.noticeQuantity);
    if (!Number.isInteger(n) || n < 1) {
      return NextResponse.json({ error: "noticeQuantity must be a positive integer" }, { status: 400 });
    }
    data.noticeQuantity = n;
  }
  if (body.noticeUnit !== undefined) {
    const u = parseNoticeUnit(body.noticeUnit);
    if (!u) return NextResponse.json({ error: "noticeUnit must be DAYS, WEEKS, or MONTHS" }, { status: 400 });
    data.noticeUnit = u;
  }

  const start = data.startDate ?? existing.startDate;
  const end = data.endDate ?? existing.endDate;
  if (end <= start) {
    return NextResponse.json({ error: "endDate must be after startDate" }, { status: 400 });
  }

  const noticeChanged =
    data.endDate !== undefined ||
    data.noticeQuantity !== undefined ||
    data.noticeUnit !== undefined ||
    data.startDate !== undefined;

  if (noticeChanged) {
    data.noticeEntryNotifiedAt = null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ certificate: existing });
  }

  const cert = await prisma.certificate.update({
    where: { id },
    data,
  });

  return NextResponse.json({ certificate: cert });
}

export async function DELETE(_request: Request, context: Ctx) {
  const { id } = await context.params;
  try {
    await prisma.certificate.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
