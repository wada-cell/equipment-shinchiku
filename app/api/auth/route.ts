import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

// POST /api/auth  → ログイン
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return NextResponse.json({ error: "メールアドレスまたはパスワードが正しくありません" }, { status: 401 });

  const token = await signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

  const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

// DELETE /api/auth → ログアウト
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
