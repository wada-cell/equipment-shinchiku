"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";

function EmailChange({ currentEmail, onUpdated }: { currentEmail: string; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/auth/email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_email: newEmail }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg("メールアドレスを変更しました");
      onUpdated();
      setTimeout(() => { setOpen(false); setMsg(""); }, 1500);
    } else {
      setMsg(data.error ?? "エラーが発生しました");
    }
  };

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setNewEmail(currentEmail); }}
        className="w-full border-2 border-neutral-200 rounded-xl py-3 text-sm font-bold text-neutral-500 hover:border-black hover:text-black transition-all">
        メールアドレスを変更する
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-black rounded-xl p-4 space-y-3">
      <p className="text-sm font-black">メールアドレス変更</p>
      <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1">新しいメールアドレス</label>
        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required
          className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black" />
      </div>
      {msg && <p className="text-sm font-bold">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => { setOpen(false); setMsg(""); }}
          className="flex-1 border-2 border-neutral-200 rounded-lg py-2.5 text-sm font-bold hover:bg-neutral-50">キャンセル</button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-bold disabled:opacity-40">
          {saving ? "変更中..." : "変更する"}
        </button>
      </div>
    </form>
  );
}

function PasswordChange() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/auth/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: current, new_password: newPw }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg("パスワードを変更しました");
      setCurrent("");
      setNewPw("");
      setTimeout(() => { setOpen(false); setMsg(""); }, 1500);
    } else {
      setMsg(data.error ?? "エラーが発生しました");
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full border-2 border-neutral-200 rounded-xl py-3 text-sm font-bold text-neutral-500 hover:border-black hover:text-black transition-all">
        パスワードを変更する
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-black rounded-xl p-4 space-y-3">
      <p className="text-sm font-black">パスワード変更</p>
      <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1">現在のパスワード</label>
        <PasswordInput value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </div>
      <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1">新しいパスワード（4文字以上）</label>
        <PasswordInput value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={4} />
      </div>
      {msg && <p className="text-sm font-bold">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => { setOpen(false); setMsg(""); }}
          className="flex-1 border-2 border-neutral-200 rounded-lg py-2.5 text-sm font-bold hover:bg-neutral-50">キャンセル</button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-bold disabled:opacity-40">
          {saving ? "変更中..." : "変更する"}
        </button>
      </div>
    </form>
  );
}
import BottomNav from "@/components/BottomNav";

interface Loan {
  id: number;
  equipment_id: number;
  equipment_name: string;
  item_number: string | null;
  expected_return_at: string;
  actual_return_at: string | null;
  site_name: string | null;
}

interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function MyPage() {
  const router = useRouter();
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/loans?active=true").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
    ]).then(([loans, me]) => {
      if (Array.isArray(loans)) setActiveLoans(loans);
      if (me) setUser(me);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  };

  const now = new Date();
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="マイページ" />

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        {/* プロフィール */}
        <div className="border-2 border-black rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-lg font-black flex-shrink-0">
              {user?.name?.slice(0, 1) ?? "?"}
            </div>
            <div>
              <p className="font-black text-lg">{user?.name ?? "---"}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              <p className="text-xs text-neutral-400">{isAdmin ? "管理者" : "スタッフ"} · 新築事業部</p>
            </div>
          </div>
        </div>

        {/* 借りている備品 */}
        <section>
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">借りている備品</p>
          {loading ? (
            <p className="text-sm text-neutral-300 text-center py-4">読み込み中...</p>
          ) : activeLoans.length === 0 ? (
            <div className="border border-neutral-200 rounded-xl p-6 text-center">
              <p className="text-sm text-neutral-300">なし</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeLoans.map((loan) => {
                const isOverdue = new Date(loan.expected_return_at) < now;
                return (
                  <button key={loan.id} onClick={() => router.push(`/equipment/${loan.equipment_id}`)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 hover:bg-neutral-50 active:scale-[0.98] transition-all ${
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
                      <p className={`text-xs mt-0.5 ${isOverdue ? "font-bold text-black" : "text-neutral-400"}`}>
                        {isOverdue ? "期限超過" : `〜${new Date(loan.expected_return_at).toLocaleDateString("ja-JP")}`}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-neutral-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* メニュー */}
        <section className="border-2 border-neutral-200 rounded-xl overflow-hidden divide-y-2 divide-neutral-200">
          <button onClick={() => router.push("/history")}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold">貸出履歴</span>
            </div>
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button onClick={() => router.push("/notifications")}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="text-sm font-bold">通知</span>
            </div>
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button onClick={() => router.push("/help")}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              <span className="text-sm font-bold">使い方ガイド</span>
            </div>
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 管理者メニュー（管理者のみ表示） */}
          {isAdmin && (
            <button onClick={() => router.push("/admin")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-black">管理者メニュー</span>
              </div>
              <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </section>

        {/* メールアドレス変更 */}
        {user && <EmailChange currentEmail={user.email} onUpdated={() => {
          fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((me) => { if (me) setUser(me); });
        }} />}

        {/* パスワード変更 */}
        <PasswordChange />

        {/* ログアウト */}
        <button onClick={handleLogout}
          className="w-full border-2 border-neutral-300 text-neutral-500 font-bold py-3 rounded-xl hover:border-black hover:text-black transition-all">
          ログアウト
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
