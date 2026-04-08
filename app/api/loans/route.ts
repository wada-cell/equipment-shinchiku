import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sendChatworkMessage, formatLoanNotification } from "@/lib/chatwork";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get("active");
  const user_id = searchParams.get("user_id");

  const db = getDb();

  let sql = `
    SELECT
      l.*,
      e.name AS equipment_name,
      e.item_number,
      c.icon AS category_icon,
      c.name AS category_name,
      c.slug AS category_slug,
      u.name AS user_name,
      u.department AS user_department
    FROM loans l
    LEFT JOIN equipment e ON l.equipment_id = e.id
    LEFT JOIN categories c ON e.category_id = c.id
    LEFT JOIN users u ON l.user_id = u.id
    WHERE 1=1
  `;

  const params: (string | number)[] = [];

  if (active === "true") {
    sql += " AND l.actual_return_at IS NULL AND l.status = 'active'";
  }

  if (user_id) {
    sql += " AND l.user_id = ?";
    params.push(Number(user_id));
  }

  sql += " ORDER BY l.created_at DESC";

  const loans = db.prepare(sql).all(...params);
  return NextResponse.json(loans);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { equipment_id, checkout_at, expected_return_at, site_name, purpose } = await req.json();

  if (!equipment_id || !checkout_at || !expected_return_at) {
    return NextResponse.json({ error: "備品・持ち出し日時・返却予定日時は必須です" }, { status: 400 });
  }

  const db = getDb();

  // 在庫チェック
  const activeLoan = db
    .prepare(
      "SELECT id FROM loans WHERE equipment_id = ? AND actual_return_at IS NULL AND status = 'active'"
    )
    .get(Number(equipment_id));

  if (activeLoan) {
    return NextResponse.json({ error: "この備品は現在貸出中です" }, { status: 409 });
  }

  const result = db
    .prepare(
      `INSERT INTO loans (equipment_id, user_id, checkout_at, expected_return_at, site_name, purpose, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`
    )
    .run(
      Number(equipment_id),
      session.id,
      checkout_at,
      expected_return_at,
      site_name ?? null,
      purpose ?? null
    );

  const loan = db.prepare("SELECT * FROM loans WHERE id = ?").get(result.lastInsertRowid);

  // Chatwork通知
  const eq = db.prepare("SELECT name, item_number FROM equipment WHERE id = ?").get(Number(equipment_id)) as any;
  if (eq) {
    sendChatworkMessage(formatLoanNotification(eq.name, eq.item_number, session.name, site_name)).catch(() => {});
  }

  return NextResponse.json(loan, { status: 201 });
}
