"use client";

import { usePathname } from "next/navigation";
import ReturnReminder from "./ReturnReminder";

export default function ReminderWrapper() {
  const pathname = usePathname();
  // ログイン画面では通知チェックしない
  if (pathname === "/login") return null;
  return <ReturnReminder />;
}
