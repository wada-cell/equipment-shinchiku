import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";

export async function POST() {
  const db = getDb();

  // 管理者ユーザー作成
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@kaede-koumuten.jp");
  if (!existingAdmin) {
    const password_hash = await bcrypt.hash("kaede2024", 10);
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run("管理者", "admin@kaede-koumuten.jp", password_hash, "admin");
  }

  // カテゴリ作成
  const shinchikuExists = db.prepare("SELECT id FROM categories WHERE slug = 'shinchiku'").get();
  if (!shinchikuExists) {
    db.prepare(
      "INSERT INTO categories (name, slug, type, icon, sort_order) VALUES (?, ?, ?, ?, ?)"
    ).run("新築備品", "shinchiku", "slot", "", 1);
  }

  const shinchiku = db.prepare("SELECT id FROM categories WHERE slug = 'shinchiku'").get() as any;

  // 既存の備品チェック
  const existingEquipment = db.prepare("SELECT COUNT(*) AS cnt FROM equipment").get() as any;
  if (existingEquipment.cnt > 0) {
    return NextResponse.json({ ok: true, message: "既にシードデータが存在します" });
  }

  const insertEquipment = db.prepare(
    `INSERT INTO equipment (category_id, name, item_number, storage_location, return_note, memo)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  // 中間検査一式 1, 2
  insertEquipment.run(shinchiku.id, "中間検査一式", "1", null, null, null);
  insertEquipment.run(shinchiku.id, "中間検査一式", "2", null, null, null);

  // レベル一式 1, 2
  insertEquipment.run(shinchiku.id, "レベル一式", "1", null, null, null);
  insertEquipment.run(shinchiku.id, "レベル一式", "2", null, null, null);

  // サーモグラフィ
  insertEquipment.run(shinchiku.id, "サーモグラフィ", null, null, null, null);

  // ホルム測定 1, 2
  insertEquipment.run(shinchiku.id, "ホルム測定", "1", null, null, null);
  insertEquipment.run(shinchiku.id, "ホルム測定", "2", null, null, null);

  // ライト 1, 2
  insertEquipment.run(shinchiku.id, "ライト", "1", null, null, null);
  insertEquipment.run(shinchiku.id, "ライト", "2", null, null, null);

  return NextResponse.json({ ok: true, message: "シードデータを投入しました" });
}
