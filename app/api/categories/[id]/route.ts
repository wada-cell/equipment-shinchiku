import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const { name, slug, type, icon, description, sort_order } = await req.json();

  const db = getDb();
  db.prepare(
    `UPDATE categories SET
      name = COALESCE(?, name),
      slug = COALESCE(?, slug),
      type = COALESCE(?, type),
      icon = COALESCE(?, icon),
      description = ?,
      sort_order = COALESCE(?, sort_order)
    WHERE id = ?`
  ).run(
    name ?? null,
    slug ?? null,
    type ?? null,
    icon ?? null,
    description ?? null,
    sort_order ?? null,
    Number(id)
  );

  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(Number(id));
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM categories WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
