"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Equipment { id: number; name: string; item_number: string | null; is_available: number; loan_user_name: string | null; }

const CATEGORY_LABELS: Record<string, string> = { shinchiku: "新築備品" };

const EQUIP_SVG: Record<string, string> = {
  "中間検査": "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  "レベル": "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15",
  "サーモグラフィ": "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
  "ホルム測定": "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 5.609c.152.607-.34 1.166-.965 1.022l-3.62-.905a9.064 9.064 0 00-4.434 0l-3.62.905c-.626.144-1.118-.415-.966-1.022L5 14.5",
  "ライト": "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
};

function getSvg(name: string) {
  for (const [k, d] of Object.entries(EQUIP_SVG)) { if (name.includes(k)) return d; }
  return "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25";
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState(CATEGORY_LABELS[slug] ?? "");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((cats: any[]) => {
      const cat = cats.find((c: any) => c.slug === slug);
      if (cat) { setCategoryName(cat.name); return fetch(`/api/equipment?category_id=${cat.id}`); }
      throw new Error("Not found");
    }).then((r) => r.json()).then((data) => { if (Array.isArray(data)) setEquipment(data); })
    .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const groupMap = new Map<string, Equipment[]>();
  const singles: Equipment[] = [];
  for (const item of equipment) {
    if (item.item_number) { const l = groupMap.get(item.name) ?? []; l.push(item); groupMap.set(item.name, l); }
    else singles.push(item);
  }

  type G = { baseName: string; total: number; available: number; isSingle: boolean; singleId?: number; singleAvailable?: boolean; };
  const groups: G[] = [];
  for (const [n, items] of groupMap) groups.push({ baseName: n, total: items.length, available: items.filter((i) => i.is_available === 1).length, isSingle: false });
  for (const item of singles) groups.push({ baseName: item.name, total: 1, available: item.is_available === 1 ? 1 : 0, isSingle: true, singleId: item.id, singleAvailable: item.is_available === 1 });

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title={categoryName || "備品一覧"} showBack />
      <main className="max-w-md mx-auto px-4 py-5">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-300">読み込み中...</div>
        ) : groups.length === 0 ? (
          <div className="border-2 border-neutral-200 rounded-2xl p-8 text-center"><p className="text-sm text-neutral-300">備品なし</p></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {groups.map((g, i) => {
              const href = g.isSingle ? `/equipment/${g.singleId}` : `/category/${slug}/${encodeURIComponent(g.baseName)}`;
              return (
                <Link key={g.baseName} href={href}
                  className="group block border-2 border-black rounded-2xl overflow-hidden hover:bg-neutral-50 active:scale-[0.97] transition-all animate-pop-in"
                  style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="bg-neutral-50 p-5 flex items-center justify-center border-b-2 border-black">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={getSvg(g.baseName)} />
                    </svg>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-black leading-tight">{g.baseName}</p>
                    <div className="mt-1.5">
                      {g.isSingle ? (
                        g.singleAvailable
                          ? <span className="text-[11px] font-bold text-neutral-400">空き</span>
                          : <span className="text-[11px] font-bold text-neutral-300">使用中</span>
                      ) : (
                        <span className="text-[11px] font-bold text-neutral-400">{g.available}/{g.total} 空き</span>
                      )}
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
