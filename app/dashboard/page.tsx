"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Loan {
  id: number;
  equipment_id: number;
  equipment_name: string;
  item_number: string | null;
  category_icon: string;
  user_name: string;
  expected_return_at: string;
  actual_return_at: string | null;
}

export default function DashboardPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    fetch("/api/loans?active=true")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLoans(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const overdueLoans = loans.filter((l) => !l.actual_return_at && new Date(l.expected_return_at) < now);
  const recentLoans = loans.slice(0, 5);

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="備品管理" />

      <main className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* 期限超過アラート */}
        {overdueLoans.length > 0 && (
          <div className="border-2 border-black rounded-xl px-4 py-3 flex items-center gap-3 bg-neutral-50">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-black">返却期限超過 {overdueLoans.length}件</p>
              <p className="text-xs text-neutral-500">確認してください</p>
            </div>
          </div>
        )}

        {/* 備品一覧 */}
        <section>
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">カテゴリ</p>
          <div className="space-y-3">
            <Link href="/category/shinchiku"
              className="group flex items-center gap-4 border-2 border-black rounded-2xl p-4 hover:bg-neutral-50 active:scale-[0.98] transition-all">
              <div className="w-14 h-14 border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.065A2.25 2.25 0 014.5 10.08V6.75a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25v3.33c0 .824-.451 1.582-1.174 1.976L13 15.17M11.42 15.17L9 21m2.42-5.83L15 21m-6-9h6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-black text-base">新築備品</p>
                <p className="text-xs text-neutral-400 mt-0.5">検査・測定・撮影機器</p>
              </div>
              <svg className="w-5 h-5 text-neutral-300 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* カレンダー */}
        <Link href="/calendar"
          className="flex items-center gap-3 border-2 border-neutral-200 rounded-xl p-3 hover:border-black active:scale-[0.98] transition-all">
          <div className="w-9 h-9 border-2 border-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <span className="text-sm font-bold flex-1">貸出カレンダー</span>
          <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* 使い方ガイド */}
        <Link href="/help"
          className="flex items-center gap-3 border-2 border-neutral-200 rounded-xl p-3 hover:border-black active:scale-[0.98] transition-all">
          <div className="w-9 h-9 border-2 border-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <span className="text-sm font-bold flex-1">使い方ガイド</span>
          <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* 貸出状況 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">貸出中</p>
            <Link href="/history" className="text-xs font-bold text-neutral-500 underline">すべて</Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-sm text-neutral-300">読み込み中...</div>
          ) : recentLoans.length === 0 ? (
            <div className="border-2 border-neutral-200 rounded-2xl p-8 text-center">
              <svg className="w-8 h-8 text-neutral-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0h-17.25" />
              </svg>
              <p className="text-sm text-neutral-300">貸出中の備品はありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLoans.map((loan) => {
                const isOverdue = new Date(loan.expected_return_at) < now;
                return (
                  <Link key={loan.id} href={`/equipment/${loan.equipment_id}`}
                    className={`flex items-center gap-3 rounded-xl p-3 border-2 hover:bg-neutral-50 active:scale-[0.98] transition-all ${
                      isOverdue ? "border-black bg-neutral-50" : "border-neutral-200"
                    }`}>
                    <div className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                      isOverdue ? "border-black" : "border-neutral-200"
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{loan.equipment_name}{loan.item_number ? ` ${loan.item_number}` : ""}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {loan.user_name} · {isOverdue ? <span className="font-bold text-black">期限超過</span> : `〜${new Date(loan.expected_return_at).toLocaleDateString("ja-JP")}`}
                      </p>
                    </div>
                    {isOverdue && <span className="text-[10px] border-2 border-black px-1.5 py-0.5 rounded font-black flex-shrink-0">超過</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
