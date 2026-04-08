import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { current_password, new_password } = await req.json();

  if (!current_password || !new_password) {
    return NextResponse.json({ error: "現在のパスワードと新しいパスワードを入力してください" }, { status: 400 });
  }

  if (new_password.length < 4) {
    return NextResponse.json({ error: "新しいパスワードは4文字以上にしてください" }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.id) as any;

  if (!user || !(await bcrypt.compare(current_password, user.password_hash))) {
    return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 401 });
  }

  const new_hash = await bcrypt.hash(new_password, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(new_hash, session.id);

  return NextResponse.json({ ok: true });
}
