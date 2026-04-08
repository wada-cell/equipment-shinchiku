import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const db = getDb();
  const users = db
    .prepare("SELECT id, name, email, role, department, created_at FROM users ORDER BY id")
    .all();

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { name, email, password, role, department } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "名前・メール・パスワードは必須です" }, { status: 400 });
  }

  const db = getDb();

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name, email, password_hash, role ?? "staff", department ?? null);

  const user = db
    .prepare("SELECT id, name, email, role, department, created_at FROM users WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(user, { status: 201 });
}
