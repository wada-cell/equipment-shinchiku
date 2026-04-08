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
  category_name: string;
  category_slug: string;
  user_name: string;
  user_department: string | null;
  checkout_at: string;
  expected_return_at: string;
  actual_return_at: string | null;
  site_name: string | null;
  purpose: string | null;
  status: string;
}

export default function HistoryPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/loans")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLoans(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const filtered = loans.filter((loan) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      loan.equipment_name.toLowerCase().includes(q) ||
      loan.user_name.toLowerCase().includes(q) ||
      (loan.site_name ?? "").toLowerCase().includes(q)
    );
  });

  const getStatusInfo = (loan: Loan) => {
    if (loan.actual_return_at) {
      return { label: "返却済", color: "bg-gray-100 text-gray-600", border: "border-gray-200" };
    }
    if (new Date(loan.expected_return_at) < now) {
      return { label: "期限超過", color: "bg-red-100 text-red-700", border: "border-red-400" };
    }
    return { label: "貸出中", color: "bg-blue-100 text-blue-700", border: "border-blue-400" };
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <Header title="貸出履歴" />

      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {/* 検索ボックス */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="備品名・担当者名で検索"
            className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] shadow-sm"
          />
        </div>

        {/* 件数表示 */}
        <p className="text-xs text-gray-500">
          {filtered.length}件
          {search && ` (「${search}」の検索結果)`}
        </p>

        {/* 履歴リスト */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
            貸出履歴がありません
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((loan) => {
              const status = getStatusInfo(loan);
              return (
                <Link
                  key={loan.id}
                  href={`/equipment/${loan.equipment_id}`}
                  className={`block bg-white rounded-2xl p-4 shadow-sm border-l-4 ${status.border} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 leading-none mt-0.5">
                      {loan.category_icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {loan.equipment_name}
                          {loan.item_number ? ` ${loan.item_number}` : ""}
                        </p>
                        <span
                          className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{loan.user_name}</span>
                          {loan.site_name ? ` · ${loan.site_name}` : ""}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(loan.checkout_at).toLocaleDateString("ja-JP")} →{" "}
                          {new Date(loan.expected_return_at).toLocaleDateString("ja-JP")}
                        </p>
                        {loan.actual_return_at && (
                          <p className="text-xs text-green-600">
                            返却: {new Date(loan.actual_return_at).toLocaleDateString("ja-JP")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
