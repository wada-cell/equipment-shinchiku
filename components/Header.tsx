"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ title = "備品管理", showBack = false, backHref }: HeaderProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) setUnreadCount(data.filter((n) => !n.is_read).length);
      })
      .catch(() => {});
  }, []);

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-black">
      <div className="max-w-md mx-auto flex items-center h-12 px-4 gap-3">
        {showBack ? (
          <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center" aria-label="戻る">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <Link href="/dashboard" className="flex-shrink-0">
            <img src="/logo.jpg" alt="楓工務店" className="h-6 w-auto object-contain" />
          </Link>
        )}
        <span className="flex-1 font-black text-sm truncate">{title}</span>
        <Link href="/notifications" className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-black text-white text-[9px] rounded-full min-w-[14px] h-3.5 flex items-center justify-center font-bold px-0.5">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
