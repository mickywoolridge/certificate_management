import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeObjectTypeName, objectTypeSlugFromName } from "@/lib/objectTypes";

export async function GET() {
  const objectTypes = await prisma.objectType.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ objectTypes });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? normalizeObjectTypeName(body.name) : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = objectTypeSlugFromName(name);
  if (!slug) {
    return NextResponse.json({ error: "name must include letters or numbers" }, { status: 400 });
  }

  try {
    const objectType = await prisma.objectType.create({
      data: { name, slug, isActive: true },
    });
    return NextResponse.json({ objectType }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Object type name already exists" }, { status: 409 });
  }
}
