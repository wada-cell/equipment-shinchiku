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
  user_name: string;
  checkout_at: string;
  expected_return_at: string;
  actual_return_at: string | null;
  site_name: string | null;
  status: string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isInRange(date: Date, start: Date, end: Date) {
  const d = date.getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= s && d <= e;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/loans")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLoans(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // 日付ごとの貸出情報
  const getLoansForDate = (date: Date) => {
    return loans.filter((loan) => {
      const start = new Date(loan.checkout_at);
      const end = loan.actual_return_at ? new Date(loan.actual_return_at) : new Date(loan.expected_return_at);
      return isInRange(date, start, end) && !loan.actual_return_at;
    });
  };

  const today = new Date();

  // 選択された日の貸出
  const selectedLoans = selectedDate ? getLoansForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="貸出カレンダー" showBack />

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* 月ナビ */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-9 h-9 border-2 border-neutral-200 rounded-lg flex items-center justify-center hover:border-black transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="font-black text-base">{year}年 {month + 1}月</p>
          <button onClick={nextMonth} className="w-9 h-9 border-2 border-neutral-200 rounded-lg flex items-center justify-center hover:border-black transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* カレンダー */}
        <div className="border-2 border-black rounded-xl overflow-hidden">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b-2 border-black bg-neutral-50">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`text-center py-2 text-xs font-black ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-neutral-600"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 日付 */}
          <div className="grid grid-cols-7">
            {/* 空白 */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 border-b border-r border-neutral-100" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const dayLoans = getLoansForDate(date);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const dayOfWeek = date.getDay();

              return (
                <button key={day} onClick={() => setSelectedDate(date)}
                  className={`h-12 border-b border-r border-neutral-100 flex flex-col items-center justify-center relative transition-colors ${
                    isSelected ? "bg-black text-white" : isToday ? "bg-neutral-100" : "hover:bg-neutral-50"
                  }`}>
                  <span className={`text-xs font-bold ${
                    isSelected ? "text-white" : dayOfWeek === 0 ? "text-red-400" : dayOfWeek === 6 ? "text-blue-400" : ""
                  }`}>
                    {day}
                  </span>
                  {dayLoans.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayLoans.slice(0, 3).map((_, j) => (
                        <div key={j} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-black"}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択日の貸出一覧 */}
        {selectedDate && (
          <div className="space-y-2">
            <p className="text-xs font-black text-neutral-400">
              {selectedDate.getMonth() + 1}/{selectedDate.getDate()}（{WEEKDAYS[selectedDate.getDay()]}）の貸出
            </p>

            {selectedLoans.length === 0 ? (
              <div className="border border-neutral-200 rounded-xl p-4 text-center">
                <p className="text-sm text-neutral-300">この日の貸出はありません</p>
              </div>
            ) : (
              selectedLoans.map((loan) => {
                const isOverdue = new Date(loan.expected_return_at) < now && !loan.actual_return_at;
                return (
                  <Link key={loan.id} href={`/equipment/${loan.equipment_id}`}
                    className={`flex items-center gap-3 rounded-xl p-3 border-2 hover:bg-neutral-50 active:scale-[0.98] transition-all ${
                      isOverdue ? "border-black" : "border-neutral-200"
                    }`}>
                    <div className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center flex-shrink-0 text-xs font-black ${
                      isOverdue ? "border-black bg-black text-white" : "border-neutral-200"
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{loan.equipment_name}{loan.item_number ? ` ${loan.item_number}` : ""}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {loan.user_name}{loan.site_name ? ` · ${loan.site_name}` : ""}
                      </p>
                    </div>
                    {isOverdue && <span className="text-[10px] border-2 border-black px-1.5 py-0.5 rounded font-black flex-shrink-0">超過</span>}
                  </Link>
                );
              })
            )}
          </div>
        )}

        {loading && <p className="text-center py-4 text-sm text-neutral-300">読み込み中...</p>}
      </main>

      <BottomNav />
    </div>
  );
}
