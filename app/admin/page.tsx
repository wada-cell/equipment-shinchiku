"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function AdminPage() {
  const router = useRouter();

  const menus = [
    { label: "備品の追加・編集", desc: "備品項目や数量の追加・変更", href: "/admin/equipment",
      svg: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25" },
    { label: "カテゴリ管理", desc: "カテゴリの追加・編集", href: "/admin/categories",
      svg: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" },
    { label: "ユーザー管理", desc: "スタッフの追加・編集・削除", href: "/admin/users",
      svg: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="管理者メニュー" showBack />
      <main className="max-w-md mx-auto px-4 py-5 space-y-3">
        <div className="border-2 border-black rounded-xl px-4 py-3">
          <p className="text-sm font-black">管理者専用</p>
          <p className="text-xs text-neutral-400 mt-0.5">備品やユーザーの追加・変更ができます</p>
        </div>

        {menus.map((m) => (
          <button key={m.href} onClick={() => router.push(m.href)}
            className="w-full flex items-center gap-4 border-2 border-neutral-200 rounded-xl p-4 hover:border-black hover:bg-neutral-50 active:scale-[0.98] transition-all text-left">
            <div className="w-10 h-10 border-2 border-neutral-300 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={m.svg} />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{m.label}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{m.desc}</p>
            </div>
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
