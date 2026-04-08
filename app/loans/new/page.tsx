"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Equipment {
  id: number;
  name: string;
  item_number: string | null;
  category_name: string;
  category_slug: string;
  category_icon: string;
}

const HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, "0")}:00`;
});

function NewLoanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const equipment_id = searchParams.get("equipment_id");

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [checkoutDate, setCheckoutDate] = useState(today);
  const [checkoutTime, setCheckoutTime] = useState("09:00");
  const [checkoutManual, setCheckoutManual] = useState(false);

  const [returnDate, setReturnDate] = useState(today);
  const [returnTime, setReturnTime] = useState("18:00");
  const [returnManual, setReturnManual] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    if (!equipment_id) return;
    fetch(`/api/equipment/${equipment_id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setEquipment(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [equipment_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const checkout_at = `${checkoutDate} ${checkoutTime}`;
      const expected_return_at = `${returnDate} ${returnTime}`;

      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment_id: Number(equipment_id),
          checkout_at,
          expected_return_at,
          site_name: siteName || undefined,
          purpose: purpose || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "申請に失敗しました");
        return;
      }

      router.push(`/equipment/${equipment_id}`);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-4 space-y-4">
      {/* 備品プレビューカード */}
      {equipment && (
        <div
          className="rounded-2xl p-5 flex items-center gap-4 text-white shadow"
          style={{
            background:
              equipment.category_slug === "chako"
                ? "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)"
                : "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
          }}
        >
          <span className="text-4xl">{equipment.category_icon}</span>
          <div>
            <p className="font-bold text-lg leading-tight">{equipment.name}</p>
            {equipment.item_number && (
              <p className="text-sm text-white/80 mt-0.5">{equipment.item_number}</p>
            )}
            <p className="text-xs text-white/70 mt-1">{equipment.category_name}</p>
          </div>
        </div>
      )}

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 space-y-5">
        {/* 使用現場・お客様名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            使用現場・お客様名
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            placeholder="例: 田中様邸"
          />
        </div>

        {/* 持ち出し日時 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">持ち出し日時</label>
          <input
            type="date"
            value={checkoutDate}
            onChange={(e) => setCheckoutDate(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] mb-2"
          />
          {!checkoutManual ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {HOUR_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCheckoutTime(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      checkoutTime === t
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCheckoutManual(true)}
                className="text-xs text-[#1e3a5f] underline"
              >
                直接入力
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="time"
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
              <button
                type="button"
                onClick={() => setCheckoutManual(false)}
                className="text-xs text-[#1e3a5f] underline"
              >
                時間選択に戻る
              </button>
            </div>
          )}
        </div>

        {/* 返却予定日時 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">返却予定日時</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] mb-2"
          />
          {!returnManual ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {HOUR_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setReturnTime(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      returnTime === t
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setReturnManual(true)}
                className="text-xs text-[#1e3a5f] underline"
              >
                直接入力
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
              <button
                type="button"
                onClick={() => setReturnManual(false)}
                className="text-xs text-[#1e3a5f] underline"
              >
                時間選択に戻る
              </button>
            </div>
          )}
        </div>

        {/* 使用目的 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">使用目的</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            placeholder="例: 現地調査"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !equipment_id}
          className="w-full bg-[#1e3a5f] text-white font-semibold py-3 rounded-xl hover:bg-[#162d4a] active:bg-[#0f2035] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "申請中..." : "貸出申請する"}
        </button>
      </form>
    </main>
  );
}

export default function NewLoanPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <Header title="貸出申請" showBack />
      <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400 text-sm">読み込み中...</div>}>
        <NewLoanForm />
      </Suspense>
      <BottomNav />
    </div>
  );
}
