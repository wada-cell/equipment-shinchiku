import type { Metadata } from "next";
import "./globals.css";
import ReminderWrapper from "@/components/ReminderWrapper";

export const metadata: Metadata = {
  title: "楓工務店 新築事業部 備品管理",
  description: "楓工務店新築事業部 備品管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: "system-ui, sans-serif", backgroundColor: "#f8f9fa", margin: 0 }}>
        {children}
        <ReminderWrapper />
      </body>
    </html>
  );
}
