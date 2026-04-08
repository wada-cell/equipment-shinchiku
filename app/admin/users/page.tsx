"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PasswordInput from "@/components/PasswordInput";

interface User { id: number; name: string; email: string; role: string; department: string | null; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff", department: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/users").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setUsers(data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("追加しました");
      setForm({ name: "", email: "", password: "", role: "staff", department: "" });
      setShowForm(false);
      load();
    } else {
      const data = await res.json();
      setMsg(data.error ?? "エラー");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このユーザーを削除しますか？")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="ユーザー管理" showBack backHref="/admin" />
      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <button onClick={() => setShowForm(!showForm)}
          className="w-full border-2 border-black rounded-xl py-3 font-black text-sm hover:bg-neutral-50 active:scale-[0.98] transition-all">
          ＋ スタッフを追加
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="border-2 border-black rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">名前 *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black" placeholder="田中太郎" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">メールアドレス *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black" placeholder="tanaka@kaede-reform.jp" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">パスワード *</label>
              <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                placeholder="初期パスワード" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">権限</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black">
                  <option value="staff">スタッフ</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">部署</label>
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black" placeholder="リノベ事業部" />
              </div>
            </div>
            {msg && <p className="text-sm font-bold">{msg}</p>}
            <button type="submit" disabled={saving}
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-40 transition-all">
              {saving ? "保存中..." : "追加する"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-center py-8 text-sm text-neutral-300">読み込み中...</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 border border-neutral-200 rounded-lg p-3">
                <div className="w-9 h-9 border-2 border-neutral-300 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 uppercase">
                  {user.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-xs text-neutral-400">{user.email} · {user.role === "admin" ? "管理者" : "スタッフ"}</p>
                </div>
                <button onClick={() => handleDelete(user.id)} className="text-xs text-neutral-400 hover:text-black font-bold flex-shrink-0">削除</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
