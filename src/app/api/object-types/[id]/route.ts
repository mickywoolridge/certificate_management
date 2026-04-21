import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeObjectTypeName, objectTypeSlugFromName } from "@/lib/objectTypes";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const { id } = await context.params;
  const existing = await prisma.objectType.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { name?: string; slug?: string; isActive?: boolean } = {};

  if (typeof body.name === "string") {
    const name = normalizeObjectTypeName(body.name);
    if (!name) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    const slug = objectTypeSlugFromName(name);
    if (!slug) {
      return NextResponse.json({ error: "name must include letters or numbers" }, { status: 400 });
    }
    data.name = name;
    data.slug = slug;
  }
  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ objectType: existing });
  }

  try {
    const objectType = await prisma.objectType.update({
      where: { id },
      data,
    });
    return NextResponse.json({ objectType });
  } catch {
    return NextResponse.json({ error: "Could not update object type" }, { status: 409 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const usageCount = await prisma.certificate.count({ where: { objectTypeId: id } });
  if (usageCount > 0) {
    return NextResponse.json(
      { error: "This object type is in use and cannot be deleted. Mark it inactive instead." },
      { status: 409 }
    );
  }

  try {
    await prisma.objectType.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
