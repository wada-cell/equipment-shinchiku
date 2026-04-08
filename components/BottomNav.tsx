"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/dashboard", label: "ホーム", d: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { href: "/history", label: "履歴", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/notifications", label: "通知", d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
  { href: "/mypage", label: "マイページ", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) setUnread(data.filter((n) => !n.is_read).length);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-black z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive ? "text-black" : "text-neutral-300"}`}>
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive ? 2.5 : 1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.d} />
                </svg>
                {tab.href === "/notifications" && unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">{unread}</span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "font-black" : "font-medium"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
