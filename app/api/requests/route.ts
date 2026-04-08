import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sendChatworkMessage, formatRequestNotification } from "@/lib/chatwork";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const db = getDb();

  const sql = `
    SELECT
      r.*,
      e.name AS equipment_name,
      e.item_number,
      c.icon AS category_icon,
      u.name AS requester_name
    FROM requests r
    LEFT JOIN equipment e ON r.equipment_id = e.id
    LEFT JOIN categories c ON e.category_id = c.id
    LEFT JOIN users u ON r.requester_id = u.id
    ORDER BY r.created_at DESC
  `;

  const requests = db.prepare(sql).all();
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { equipment_id, desired_from, desired_to, message } = await req.json();

  if (!equipment_id) {
    return NextResponse.json({ error: "備品IDは必須です" }, { status: 400 });
  }

  const db = getDb();

  const result = db
    .prepare(
      `INSERT INTO requests (equipment_id, requester_id, desired_from, desired_to, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    )
    .run(
      Number(equipment_id),
      session.id,
      desired_from ?? null,
      desired_to ?? null,
      message ?? null
    );

  // 現在借りている人に通知を作成
  const activeLoan = db
    .prepare(
      "SELECT l.*, u.name AS user_name FROM loans l LEFT JOIN users u ON l.user_id = u.id WHERE l.equipment_id = ? AND l.actual_return_at IS NULL AND l.status = 'active'"
    )
    .get(Number(equipment_id)) as any;

  if (activeLoan) {
    const equipment = db.prepare("SELECT * FROM equipment WHERE id = ?").get(Number(equipment_id)) as any;
    const equipName = equipment ? `${equipment.name}${equipment.item_number ? " " + equipment.item_number : ""}` : "備品";

    db.prepare(
      `INSERT INTO notifications (user_id, type, title, body, ref_type, ref_id)
       VALUES (?, 'request', ?, ?, 'request', ?)`
    ).run(
      activeLoan.user_id,
      `${equipName}の使用リクエスト`,
      `${session.name}さんが${equipName}の使用をリクエストしています。${message ? `\nメッセージ: ${message}` : ""}`,
      result.lastInsertRowid
    );
  }

  // Chatwork通知
  const eq = db.prepare("SELECT name FROM equipment WHERE id = ?").get(Number(equipment_id)) as any;
  if (eq) {
    sendChatworkMessage(formatRequestNotification(eq.name, session.name, message)).catch(() => {});
  }

  const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(request, { status: 201 });
}
