import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const { name, email, password, role, department } = await req.json();

  const db = getDb();

  if (password) {
    const password_hash = await bcrypt.hash(password, 10);
    db.prepare(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        password_hash = ?,
        role = COALESCE(?, role),
        department = ?
       WHERE id = ?`
    ).run(name ?? null, email ?? null, password_hash, role ?? null, department ?? null, Number(id));
  } else {
    db.prepare(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        department = ?
       WHERE id = ?`
    ).run(name ?? null, email ?? null, role ?? null, department ?? null, Number(id));
  }

  const user = db
    .prepare("SELECT id, name, email, role, department, created_at FROM users WHERE id = ?")
    .get(Number(id));

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
