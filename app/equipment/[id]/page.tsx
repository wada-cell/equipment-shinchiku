"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Equipment {
  id: number; name: string; item_number: string | null; category_name: string; category_slug: string; category_icon: string;
  manager_name: string | null; storage_location: string | null; return_note: string | null; memo: string | null;
  is_available: number; loan_id: number | null; loan_user_id: number | null; loan_user_name: string | null;
  checkout_at: string | null; expected_return_at: string | null; purpose: string | null; site_name: string | null;
}
interface Reservation { id: number; user_name: string; reserved_from: string; reserved_to: string; site_name: string | null; user_id: number; }
interface SessionUser { id: number; name: string; role: string; }

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const [requestSending, setRequestSending] = useState(false);
  const [message, setMessage] = useState("");

  // 予約フォーム
  const [showReserve, setShowReserve] = useState(false);
  const [resForm, setResForm] = useState({ reserved_from: "", reserved_to: "", site_name: "", purpose: "" });
  const [resSaving, setResSaving] = useState(false);
  const [resMsg, setResMsg] = useState("");

  const fetchAll = () => {
    Promise.all([
      fetch(`/api/equipment/${id}`).then((r) => r.json()),
      fetch(`/api/reservations?equipment_id=${id}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
    ]).then(([eq, res, me]) => {
      if (!eq.error) setEquipment(eq);
      if (Array.isArray(res)) setReservations(res);
      if (me) setSession(me);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleReturn = async () => {
    if (!equipment?.loan_id || !confirm("返却しますか？")) return;
    setReturning(true);
    await fetch(`/api/loans/${equipment.loan_id}`, { method: "PUT" });
    await fetchAll();
    setReturning(false);
  };

  const handleRequest = async () => {
    setRequestSending(true);
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipment_id: equipment?.id, message: message || undefined }),
    });
    alert("使用リクエストを送信しました");
    setRequestSending(false);
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setResSaving(true);
    setResMsg("");
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipment_id: Number(id), ...resForm }),
    });
    setResSaving(false);
    if (res.ok) {
      setResMsg("予約しました");
      setShowReserve(false);
      setResForm({ reserved_from: "", reserved_to: "", site_name: "", purpose: "" });
      fetchAll();
    } else {
      const data = await res.json();
      setResMsg(data.error ?? "エラー");
    }
  };

  const handleCancelReservation = async (resId: number) => {
    if (!confirm("この予約をキャンセルしますか？")) return;
    await fetch(`/api/reservations/${resId}`, { method: "DELETE" });
    fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <Header title="備品詳細" showBack />
        <div className="text-center py-16 text-sm text-neutral-300">読み込み中...</div>
        <BottomNav />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <Header title="備品詳細" showBack />
        <div className="text-center py-16 text-sm text-neutral-300">備品が見つかりません</div>
        <BottomNav />
      </div>
    );
  }

  const isAvailable = equipment.is_available === 1;
  const isMyLoan = session && equipment.loan_user_id === session.id;
  const isOverdue = !isAvailable && equipment.expected_return_at && new Date(equipment.expected_return_at) < new Date();

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title={equipment.name} showBack backHref={`/category/${equipment.category_slug}`} />

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        {/* 備品情報 */}
        <div className="border-2 border-black rounded-2xl overflow-hidden">
          <div className="bg-neutral-50 border-b-2 border-black p-5 text-center">
            <p className="text-3xl mb-2">
              <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25" />
              </svg>
            </p>
            <h1 className="text-lg font-black">{equipment.name}</h1>
            {equipment.item_number && <p className="text-sm text-neutral-400 font-bold mt-1">{equipment.item_number}</p>}
          </div>

          <div className="p-4 space-y-2.5">
            <Row label="カテゴリ" value={equipment.category_name} />
            {equipment.storage_location && <Row label="保管場所" value={equipment.storage_location} />}
            {equipment.manager_name && <Row label="管理者" value={equipment.manager_name} />}
            {equipment.memo && <Row label="内容物" value={equipment.memo} />}
            {equipment.return_note && (
              <div className="border-2 border-black rounded-xl p-3 bg-neutral-50">
                <p className="text-xs font-black mb-1">返却時の注意</p>
                <p className="text-sm">{equipment.return_note}</p>
              </div>
            )}
          </div>
        </div>

        {/* 貸出状況 */}
        <div className="border-2 border-neutral-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">現在の状況</p>

          {isAvailable ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-neutral-400">空き・貸出可能</p>
              <Link href={`/loans/new?equipment_id=${equipment.id}`}
                className="block w-full text-center bg-black text-white font-bold py-3 rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all">
                貸出申請する
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className={`text-sm font-black ${isOverdue ? "text-black" : "text-neutral-500"}`}>
                {isOverdue ? "期限超過" : "使用中"}
              </p>
              <div className="border border-neutral-200 rounded-xl p-3 space-y-1.5">
                <Row label="使用者" value={equipment.loan_user_name ?? ""} />
                {equipment.checkout_at && <Row label="持ち出し" value={new Date(equipment.checkout_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} />}
                {equipment.expected_return_at && <Row label="返却予定" value={new Date(equipment.expected_return_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} />}
                {equipment.site_name && <Row label="現場" value={equipment.site_name} />}
              </div>

              {isMyLoan ? (
                <button onClick={handleReturn} disabled={returning}
                  className="w-full border-2 border-black bg-white font-black py-3 rounded-xl hover:bg-neutral-50 active:scale-[0.98] transition-all disabled:opacity-40">
                  {returning ? "処理中..." : "返却する"}
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="メッセージ（任意）" rows={2}
                    className="w-full px-3 py-2 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
                  <button onClick={handleRequest} disabled={requestSending}
                    className="w-full border-2 border-neutral-300 font-bold py-3 rounded-xl hover:border-black active:scale-[0.98] transition-all disabled:opacity-40 text-sm">
                    {requestSending ? "送信中..." : "使用リクエストを送る"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 予約状況 */}
        <div className="border-2 border-neutral-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">予約</p>
            <button onClick={() => setShowReserve(!showReserve)}
              className="text-xs font-bold border-2 border-neutral-200 px-3 py-1 rounded-lg hover:border-black transition-colors">
              ＋ 予約する
            </button>
          </div>

          {showReserve && (
            <form onSubmit={handleReserve} className="border-2 border-black rounded-xl p-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">開始日時 *</label>
                  <input type="datetime-local" value={resForm.reserved_from} onChange={(e) => setResForm({ ...resForm, reserved_from: e.target.value })} required
                    className="w-full border-2 border-neutral-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">終了日時 *</label>
                  <input type="datetime-local" value={resForm.reserved_to} onChange={(e) => setResForm({ ...resForm, reserved_to: e.target.value })} required
                    className="w-full border-2 border-neutral-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-black" />
                </div>
              </div>
              <input type="text" value={resForm.site_name} onChange={(e) => setResForm({ ...resForm, site_name: e.target.value })}
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black" placeholder="現場名" />
              <input type="text" value={resForm.purpose} onChange={(e) => setResForm({ ...resForm, purpose: e.target.value })}
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black" placeholder="使用目的" />
              {resMsg && <p className="text-sm font-bold">{resMsg}</p>}
              <button type="submit" disabled={resSaving}
                className="w-full bg-black text-white font-bold py-2.5 rounded-xl disabled:opacity-40 text-sm">
                {resSaving ? "予約中..." : "予約する"}
              </button>
            </form>
          )}

          {reservations.length === 0 ? (
            <p className="text-sm text-neutral-300">予約なし</p>
          ) : (
            <div className="space-y-2">
              {reservations.map((res) => (
                <div key={res.id} className="flex items-center gap-3 border border-neutral-200 rounded-lg p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{res.user_name}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(res.reserved_from).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" → "}
                      {new Date(res.reserved_to).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {res.site_name && <p className="text-xs text-neutral-400">{res.site_name}</p>}
                  </div>
                  {session && (session.id === res.user_id || session.role === "admin") && (
                    <button onClick={() => handleCancelReservation(res.id)} className="text-xs text-neutral-400 hover:text-black font-bold">取消</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-bold text-neutral-400 w-16 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
