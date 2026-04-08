import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const equipment = db
    .prepare(
      `SELECT
        e.*,
        c.name AS category_name,
        c.slug AS category_slug,
        c.icon AS category_icon,
        u.name AS manager_name,
        CASE WHEN l.id IS NULL THEN 1 ELSE 0 END AS is_available,
        l.id AS loan_id,
        l.user_id AS loan_user_id,
        lu.name AS loan_user_name,
        l.checkout_at,
        l.expected_return_at,
        l.site_name,
        l.purpose
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN users u ON e.manager_id = u.id
      LEFT JOIN loans l ON l.equipment_id = e.id AND l.actual_return_at IS NULL AND l.status = 'active'
      LEFT JOIN users lu ON l.user_id = lu.id
      WHERE e.id = ?`
    )
    .get(Number(id));

  if (!equipment) {
    return NextResponse.json({ error: "備品が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(equipment);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { category_id, name, item_number, manager_id, storage_location, return_note, image_url, memo, is_active } =
    body;

  const db = getDb();
  db.prepare(
    `UPDATE equipment SET
      category_id = COALESCE(?, category_id),
      name = COALESCE(?, name),
      item_number = ?,
      manager_id = ?,
      storage_location = ?,
      return_note = ?,
      image_url = ?,
      memo = ?,
      is_active = COALESCE(?, is_active)
    WHERE id = ?`
  ).run(
    category_id ?? null,
    name ?? null,
    item_number ?? null,
    manager_id ?? null,
    storage_location ?? null,
    return_note ?? null,
    image_url ?? null,
    memo ?? null,
    is_active ?? null,
    Number(id)
  );

  const equipment = db.prepare("SELECT * FROM equipment WHERE id = ?").get(Number(id));
  return NextResponse.json(equipment);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  db.prepare("UPDATE equipment SET is_active = 0 WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
