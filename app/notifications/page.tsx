"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  is_read: number;
  created_at: string;
  ref_type: string | null;
  ref_id: number | null;
}

const TYPE_ICONS: Record<string, string> = {
  request: "📩",
  return: "✅",
  overdue: "⚠️",
  system: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchNotifications = () => {
    return fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", { method: "PUT" });
    await fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filtered = showUnreadOnly ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <Header title="通知" showBack />

      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {/* ツールバー */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                !showUnreadOnly
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                showUnreadOnly
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              未読
              {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-[#1e3a5f] font-medium underline"
            >
              全て既読にする
            </button>
          )}
        </div>

        {/* 通知リスト */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
            {showUnreadOnly ? "未読の通知はありません" : "通知はありません"}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl p-4 shadow-sm transition-opacity ${
                  notification.is_read ? "opacity-60" : "border-l-4 border-[#1e3a5f]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 leading-none mt-0.5">
                    {TYPE_ICONS[notification.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notification.is_read ? "text-gray-600" : "text-gray-800"}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
