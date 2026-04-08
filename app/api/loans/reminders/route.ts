import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { sendChatworkMessage, formatReturnReminder, formatOverdueAlert } from "@/lib/chatwork";

// GET /api/loans/reminders — 返却期限チェック＆Chatwork通知
export async function GET() {
  const db = getDb();

  // 未返却の貸出を取得
  const loans = db.prepare(`
    SELECT l.*, e.name AS equipment_name, e.item_number, u.name AS user_name
    FROM loans l
    JOIN equipment e ON l.equipment_id = e.id
    JOIN users u ON l.user_id = u.id
    WHERE l.actual_return_at IS NULL AND l.status = 'active'
  `).all() as any[];

  const now = new Date().getTime();
  const oneHour = 60 * 60 * 1000;
  let notified = 0;

  for (const loan of loans) {
    const returnTime = new Date(loan.expected_return_at).getTime();
    const diff = returnTime - now;

    // 通知済みフラグチェック（notificationsテーブルを利用）
    const alreadyNotified = (type: string) => {
      const existing = db.prepare(
        "SELECT id FROM notifications WHERE ref_type = 'loan_reminder' AND ref_id = ? AND type = ?"
      ).get(loan.id, type);
      return !!existing;
    };

    const returnDateStr = new Date(loan.expected_return_at).toLocaleString("ja-JP", {
      month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
    });

    // 期限超過（初回のみ）
    if (diff < 0 && !alreadyNotified("overdue")) {
      await sendChatworkMessage(
        formatOverdueAlert(loan.equipment_name, loan.item_number, loan.user_name, returnDateStr)
      );

      db.prepare(
        "INSERT INTO notifications (user_id, type, title, body, ref_type, ref_id) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(loan.user_id, "overdue", "返却期限を過ぎています", `${loan.equipment_name} を至急返却してください`, "loan_reminder", loan.id);

      notified++;
    }
  }

  return NextResponse.json({ ok: true, checked: loans.length, notified });
}
