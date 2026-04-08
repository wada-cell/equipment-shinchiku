import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const reservation = db.prepare("SELECT * FROM reservations WHERE id = ?").get(Number(id)) as any;
  if (!reservation) return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });

  if (reservation.user_id !== session.id && session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
