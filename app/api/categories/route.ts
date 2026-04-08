import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const db = getDb();
  const categories = db.prepare("SELECT * FROM categories ORDER BY sort_order, id").all();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { name, slug, type, icon, description, sort_order } = await req.json();
  if (!name || !slug) {
    return NextResponse.json({ error: "名前とスラッグは必須です" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO categories (name, slug, type, icon, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(name, slug, type ?? "slot", icon ?? "📦", description ?? null, sort_order ?? 0);

  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(category, { status: 201 });
}
