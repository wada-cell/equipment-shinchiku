const CHATWORK_API_TOKEN = process.env.CHATWORK_API_TOKEN ?? "066590a096c512b1abaadfdbdf7df46d";
const CHATWORK_ROOM_ID = process.env.CHATWORK_ROOM_ID ?? "432973588";

export async function sendChatworkMessage(message: string) {
  try {
    const res = await fetch(
      `https://api.chatwork.com/v2/rooms/${CHATWORK_ROOM_ID}/messages`,
      {
        method: "POST",
        headers: {
          "X-ChatWorkToken": CHATWORK_API_TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `body=${encodeURIComponent(message)}`,
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function formatReturnReminder(equipmentName: string, itemNumber: string | null, userName: string, expectedReturn: string) {
  const name = equipmentName + (itemNumber ? ` ${itemNumber}` : "");
  return `[info][title]返却期限のお知らせ[/title]${name} の返却期限が近づいています。\n使用者: ${userName}\n返却予定: ${expectedReturn}\nお忘れなく返却をお願いします。[/info]`;
}

export function formatOverdueAlert(equipmentName: string, itemNumber: string | null, userName: string, expectedReturn: string) {
  const name = equipmentName + (itemNumber ? ` ${itemNumber}` : "");
  return `[info][title]【期限超過】返却してください[/title]${name} の返却期限を過ぎています！\n使用者: ${userName}\n返却予定: ${expectedReturn}\n至急返却をお願いします。[/info]`;
}

export function formatRequestNotification(equipmentName: string, requesterName: string, message?: string) {
  return `[info][title]使用リクエスト[/title]${requesterName} さんが ${equipmentName} の使用をリクエストしています。${message ? `\nメッセージ: ${message}` : ""}\n調整をお願いします。[/info]`;
}

export function formatLoanNotification(equipmentName: string, itemNumber: string | null, userName: string, siteName?: string) {
  const name = equipmentName + (itemNumber ? ` ${itemNumber}` : "");
  return `[info][title]備品貸出[/title]${userName} さんが ${name} を持ち出しました。${siteName ? `\n現場: ${siteName}` : ""}[/info]`;
}

export function formatReturnNotification(equipmentName: string, itemNumber: string | null, userName: string) {
  const name = equipmentName + (itemNumber ? ` ${itemNumber}` : "");
  return `[info][title]備品返却[/title]${userName} さんが ${name} を返却しました。[/info]`;
}
