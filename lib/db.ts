import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "equipment.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (db) return db;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema();
  autoSeed();
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      department TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'slot',
      icon TEXT DEFAULT '',
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      item_number TEXT,
      manager_id INTEGER REFERENCES users(id),
      storage_location TEXT,
      return_note TEXT,
      image_url TEXT,
      memo TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL REFERENCES equipment(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      checkout_at TEXT NOT NULL,
      expected_return_at TEXT NOT NULL,
      actual_return_at TEXT,
      site_name TEXT,
      purpose TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL REFERENCES equipment(id),
      requester_id INTEGER NOT NULL REFERENCES users(id),
      desired_from TEXT,
      desired_to TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL REFERENCES equipment(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      reserved_from TEXT NOT NULL,
      reserved_to TEXT NOT NULL,
      site_name TEXT,
      purpose TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      ref_type TEXT,
      ref_id INTEGER,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);
}

function autoSeed() {
  const existing = db.prepare("SELECT COUNT(*) AS cnt FROM users").get() as any;
  if (existing.cnt > 0) return;

  // bcryptの同期版がないので、固定ハッシュを使用（kaede2024のbcryptハッシュ）
  const bcryptHash = "$2a$10$nWg3tBJBRLyorP7L1YfhyO7GuPbFvgGkcBpA6X/JIa94zav2tBqtC";

  db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  ).run("管理者", "admin@kaede-koumuten.jp", bcryptHash, "admin");

  // カテゴリ
  db.prepare(
    "INSERT INTO categories (name, slug, type, icon, sort_order) VALUES (?, ?, ?, ?, ?)"
  ).run("新築備品", "shinchiku", "slot", "", 1);

  const shinchiku = db.prepare("SELECT id FROM categories WHERE slug = 'shinchiku'").get() as any;
  const catId = shinchiku.id;

  const ins = db.prepare(
    "INSERT INTO equipment (category_id, name, item_number, storage_location, return_note, memo) VALUES (?, ?, ?, ?, ?, ?)"
  );

  ins.run(catId, "中間検査一式", "1", null, null, null);
  ins.run(catId, "中間検査一式", "2", null, null, null);
  ins.run(catId, "レベル一式", "1", null, null, null);
  ins.run(catId, "レベル一式", "2", null, null, null);
  ins.run(catId, "サーモグラフィ", null, null, null, null);
  ins.run(catId, "ホルム測定", "1", null, null, null);
  ins.run(catId, "ホルム測定", "2", null, null, null);
  ins.run(catId, "ライト", "1", null, null, null);
  ins.run(catId, "ライト", "2", null, null, null);
}

export default getDb;
