"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Equipment { id: number; name: string; item_number: string | null; storage_location: string | null; is_available: number; loan_user_name: string | null; expected_return_at: string | null; site_name: string | null; }

export default function GroupPage() {
  const params = useParams();
  const slug = params.slug as string;
  const groupName = decodeURIComponent(params.group as string);
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((cats: any[]) => {
      const cat = cats.find((c: any) => c.slug === slug);
      if (cat) return fetch(`/api/equipment?category_id=${cat.id}`);
      throw new Error("Not found");
    }).then((r) => r.json()).then((data: Equipment[]) => {
      if (Array.isArray(data)) setItems(data.filter((e) => e.name === groupName).sort((a, b) => (a.item_number ?? "").localeCompare(b.item_number ?? "")));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug, groupName]);

  const availCount = items.filter((i) => i.is_available === 1).length;

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title={groupName} showBack backHref={`/category/${slug}`} />
      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <div className="border-2 border-black rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-black">{groupName}</p>
            <p className="text-xs text-neutral-400 mt-0.5">全{items.length}個</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">{availCount}</span>
            <span className="text-xs text-neutral-400 ml-1">空き</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-neutral-300">読み込み中...</div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => {
              const avail = item.is_available === 1;
              const isOverdue = !avail && item.expected_return_at && new Date(item.expected_return_at) < new Date();
              return (
                <Link key={item.id} href={`/equipment/${item.id}`}
                  className={`flex items-center gap-3 rounded-xl p-3.5 border-2 hover:bg-neutral-50 active:scale-[0.98] transition-all animate-pop-in ${
                    isOverdue ? "border-black bg-neutral-50" : avail ? "border-neutral-200" : "border-neutral-300"
                  }`}
                  style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    avail ? "border-black bg-white" : isOverdue ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-400"
                  }`}>
                    {item.item_number ?? "#"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{item.name} {item.item_number}</p>
                    {item.storage_location && <p className="text-xs text-neutral-400 mt-0.5">{item.storage_location}</p>}
                    {!avail && item.loan_user_name && (
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        {item.loan_user_name}{item.site_name ? ` · ${item.site_name}` : ""}
                      </p>
                    )}
                  </div>
                  {avail ? (
                    <span className="text-[11px] font-bold text-neutral-400 flex-shrink-0">空き</span>
                  ) : isOverdue ? (
                    <span className="text-[11px] font-black border-2 border-black px-1.5 py-0.5 rounded flex-shrink-0">超過</span>
                  ) : (
                    <span className="text-[11px] font-bold text-neutral-300 flex-shrink-0">使用中</span>
                  )}
                  <svg className="w-4 h-4 text-neutral-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
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
