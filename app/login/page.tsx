"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "ログインに失敗しました"); return; }
      router.push("/dashboard");
    } catch { setError("通信エラーが発生しました"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <img src="/logo.jpg" alt="楓工務店" className="h-14 w-auto object-contain" />
        </div>

        <div className="border-2 border-black rounded-2xl p-7">
          <p className="text-center text-xs font-bold text-neutral-400 tracking-widest uppercase mb-1">新築事業部</p>
          <h1 className="text-center text-lg font-black text-black mb-7">備品管理ログイン</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1.5">メールアドレス</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                placeholder="name@kaede-reform.jp" autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1.5">パスワード</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors placeholder:text-neutral-300 pr-10"
                placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && <div className="text-red-600 text-sm font-medium px-1">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-40">
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
