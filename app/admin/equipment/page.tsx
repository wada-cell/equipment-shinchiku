"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Category { id: number; name: string; slug: string; }
interface Equipment { id: number; name: string; item_number: string | null; category_id: number; category_name: string; storage_location: string | null; return_note: string | null; memo: string | null; is_active: number; }

export default function AdminEquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category_id: "", name: "", item_number: "", storage_location: "", return_note: "", memo: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    Promise.all([
      fetch("/api/equipment").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([eq, cats]) => {
      if (Array.isArray(eq)) setItems(eq);
      if (Array.isArray(cats)) setCategories(cats);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, category_id: Number(form.category_id) }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("追加しました");
      setForm({ category_id: "", name: "", item_number: "", storage_location: "", return_note: "", memo: "" });
      setShowForm(false);
      load();
    } else {
      const data = await res.json();
      setMsg(data.error ?? "エラー");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この備品を非表示にしますか？")) return;
    await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="備品の追加・編集" showBack backHref="/admin" />
      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <button onClick={() => setShowForm(!showForm)}
          className="w-full border-2 border-black rounded-xl py-3 font-black text-sm hover:bg-neutral-50 active:scale-[0.98] transition-all">
          ＋ 備品を追加
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="border-2 border-black rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">カテゴリ *</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black">
                <option value="">選択</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">備品名 *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                placeholder="例: キーボックス" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">番号</label>
                <input type="text" value={form.item_number} onChange={(e) => setForm({ ...form, item_number: e.target.value })}
                  className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  placeholder="例: No.10" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">保管場所</label>
                <input type="text" value={form.storage_location} onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                  className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  placeholder="例: イナバ倉庫" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">返却時の注意</label>
              <input type="text" value={form.return_note} onChange={(e) => setForm({ ...form, return_note: e.target.value })}
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                placeholder="例: ナンバーを0000に戻す" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">メモ</label>
              <input type="text" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })}
                className="w-full border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                placeholder="自由入力" />
            </div>
            {msg && <p className="text-sm font-bold">{msg}</p>}
            <button type="submit" disabled={saving}
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-40 transition-all">
              {saving ? "保存中..." : "追加する"}
            </button>
          </form>
        )}

        {/* 一覧 */}
        {loading ? (
          <p className="text-center py-8 text-sm text-neutral-300">読み込み中...</p>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border border-neutral-200 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}{item.item_number ? ` ${item.item_number}` : ""}</p>
                  <p className="text-xs text-neutral-400">{item.category_name}{item.storage_location ? ` · ${item.storage_location}` : ""}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-neutral-400 hover:text-black font-bold flex-shrink-0">削除</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
