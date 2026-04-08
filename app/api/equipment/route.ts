import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category_id = searchParams.get("category_id");

  const db = getDb();

  let sql = `
    SELECT
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
      l.site_name
    FROM equipment e
    LEFT JOIN categories c ON e.category_id = c.id
    LEFT JOIN users u ON e.manager_id = u.id
    LEFT JOIN loans l ON l.equipment_id = e.id AND l.actual_return_at IS NULL AND l.status = 'active'
    LEFT JOIN users lu ON l.user_id = lu.id
    WHERE e.is_active = 1
  `;

  const params: (string | number)[] = [];
  if (category_id) {
    sql += " AND e.category_id = ?";
    params.push(Number(category_id));
  }

  sql += " ORDER BY e.category_id, e.item_number, e.id";

  const equipment = db.prepare(sql).all(...params);
  return NextResponse.json(equipment);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { category_id, name, item_number, manager_id, storage_location, return_note, image_url, memo } =
    await req.json();

  if (!category_id || !name) {
    return NextResponse.json({ error: "カテゴリと備品名は必須です" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO equipment (category_id, name, item_number, manager_id, storage_location, return_note, image_url, memo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      category_id,
      name,
      item_number ?? null,
      manager_id ?? null,
      storage_location ?? null,
      return_note ?? null,
      image_url ?? null,
      memo ?? null
    );

  const equipment = db.prepare("SELECT * FROM equipment WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(equipment, { status: 201 });
}
