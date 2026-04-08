import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const equipment_id = searchParams.get("equipment_id");

  const db = getDb();

  let sql = `
    SELECT r.*, u.name AS user_name, e.name AS equipment_name, e.item_number
    FROM reservations r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN equipment e ON r.equipment_id = e.id
    WHERE r.status = 'active'
  `;
  const params: (string | number)[] = [];

  if (equipment_id) {
    sql += " AND r.equipment_id = ?";
    params.push(Number(equipment_id));
  }

  sql += " ORDER BY r.reserved_from ASC";

  const reservations = db.prepare(sql).all(...params);
  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { equipment_id, reserved_from, reserved_to, site_name, purpose } = await req.json();

  if (!equipment_id || !reserved_from || !reserved_to) {
    return NextResponse.json({ error: "備品・予約開始・予約終了は必須です" }, { status: 400 });
  }

  const db = getDb();

  // 重複チェック（同じ備品で同じ期間に予約 or 貸出がないか）
  const overlap = db.prepare(`
    SELECT id FROM reservations
    WHERE equipment_id = ? AND status = 'active'
      AND reserved_from < ? AND reserved_to > ?
  `).get(Number(equipment_id), reserved_to, reserved_from);

  if (overlap) {
    return NextResponse.json({ error: "この期間は既に予約されています" }, { status: 409 });
  }

  const loanOverlap = db.prepare(`
    SELECT id FROM loans
    WHERE equipment_id = ? AND status = 'active' AND actual_return_at IS NULL
      AND checkout_at < ? AND expected_return_at > ?
  `).get(Number(equipment_id), reserved_to, reserved_from);

  if (loanOverlap) {
    return NextResponse.json({ error: "この期間は貸出中です" }, { status: 409 });
  }

  const result = db.prepare(`
    INSERT INTO reservations (equipment_id, user_id, reserved_from, reserved_to, site_name, purpose)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(Number(equipment_id), session.id, reserved_from, reserved_to, site_name ?? null, purpose ?? null);

  const reservation = db.prepare("SELECT * FROM reservations WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(reservation, { status: 201 });
}
