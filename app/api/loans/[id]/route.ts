import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sendChatworkMessage, formatReturnNotification } from "@/lib/chatwork";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const loan = db.prepare("SELECT * FROM loans WHERE id = ?").get(Number(id)) as any;
  if (!loan) {
    return NextResponse.json({ error: "貸出記録が見つかりません" }, { status: 404 });
  }

  if (loan.user_id !== session.id && session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }).replace(/\//g, "-");

  db.prepare(
    "UPDATE loans SET actual_return_at = ?, status = 'returned' WHERE id = ?"
  ).run(now, Number(id));

  const updated = db.prepare("SELECT * FROM loans WHERE id = ?").get(Number(id));

  // Chatwork通知
  const eq = db.prepare("SELECT name, item_number FROM equipment WHERE id = ?").get(loan.equipment_id) as any;
  if (eq) {
    sendChatworkMessage(formatReturnNotification(eq.name, eq.item_number, session.name)).catch(() => {});
  }

  return NextResponse.json(updated);
}
