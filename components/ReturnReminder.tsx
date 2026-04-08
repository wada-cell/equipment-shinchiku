"use client";

import { useEffect, useRef } from "react";

export default function ReturnReminder() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // ブラウザ通知の許可を求める
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      try {
        const res = await fetch("/api/loans?active=true");
        const loans = await res.json();
        if (!Array.isArray(loans)) return;

        const now = new Date().getTime();

        for (const loan of loans) {
          const returnTime = new Date(loan.expected_return_at).getTime();
          const diff = returnTime - now;
          const oneHour = 60 * 60 * 1000;
          const loanKey = loan.id;

          // 期限超過通知（30分ごと）
          if (diff < 0) {
            const overdueKey = loanKey * 10000 + Math.floor(Math.abs(diff) / (30 * 60 * 1000));
            if (!notifiedRef.current.has(overdueKey)) {
              notifiedRef.current.add(overdueKey);
              sendNotification(
                "返却期限を過ぎています！",
                `${loan.equipment_name}${loan.item_number ? ` ${loan.item_number}` : ""} を返却してください`
              );
            }
          }
        }
      } catch {}
    };

    // サーバー側のChatwork通知チェックも呼ぶ
    const checkServer = () => { fetch("/api/loans/reminders").catch(() => {}); };

    // 1分ごとにブラウザ通知チェック、5分ごとにサーバー側（Chatwork）チェック
    checkReminders();
    checkServer();
    intervalRef.current = setInterval(checkReminders, 60 * 1000);
    const serverInterval = setInterval(checkServer, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(serverInterval);
    };
  }, []);

  return null;
}

function sendNotification(title: string, body: string) {
  // アラート音
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => {
      osc.frequency.value = 1000;
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 150);
    }, 150);
  } catch {}

  // ブラウザ通知
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/logo.jpg" });
  }
}
