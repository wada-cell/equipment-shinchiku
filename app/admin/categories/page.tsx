"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Category { id: number; name: string; slug: string; type: string; icon: string; sort_order: number; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", type: "slot", icon: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/categories").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setCategories(data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("追加しました");
      setForm({ name: "", slug: "", type: "slot", icon: "" });
      setShowForm(false);
      load();
    } else {
      const data = await res.json();
      setMsg(data.error ?? "エラー");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="カテゴリ管理" showBack backHref="/admin" />
      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <button onClick={() => setShowForm(!showForm)}
          className="w-full border-2 border-black rounded-xl py-3 font-black text-sm hover:bg-neutral-50 active:scale-[0.98] transition-all">
          ＋ カテゴリを追加
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="border-2 border-black rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">カテゴリ名 *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                placeholder="例: 車両備品" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">スラッグ *</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required
                  className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  placeholder="例: vehicle" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">タイプ</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black">
                  <option value="slot">時間スロット</option>
                  <option value="long-term">長期貸出</option>
                </select>
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
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 border-2 border-neutral-200 rounded-xl p-4">
                <div className="w-10 h-10 border-2 border-neutral-300 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {cat.icon || "📦"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{cat.name}</p>
                  <p className="text-xs text-neutral-400">/{cat.slug} · {cat.type === "long-term" ? "長期" : "スロット"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
