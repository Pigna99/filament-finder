"use client";

import { useEffect, useState, useCallback } from "react";
import { getCompareIds, setCompareIds, onCompareChange } from "@/lib/compare";
import { useRouter } from "next/navigation";

export default function ConfróntoBar() {
  const [ids, setIds] = useState<number[]>([]);
  const router = useRouter();

  const sync = useCallback(() => setIds(getCompareIds()), []);

  useEffect(() => {
    sync();
    return onCompareChange(sync);
  }, [sync]);

  if (ids.length < 2) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-emerald-700/60 shadow-lg shadow-emerald-900/30 rounded-2xl px-5 py-3">
      <span className="text-sm text-zinc-300">
        <span className="text-emerald-400 font-semibold">{ids.length}</span> filamenti selezionati
      </span>
      <button
        onClick={() => router.push(`/confronta?ids=${ids.join(",")}`)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors"
      >
        Confronta →
      </button>
      <button
        onClick={() => setCompareIds([])}
        className="text-zinc-500 hover:text-zinc-300 text-sm px-2 transition-colors"
        title="Svuota selezione"
      >
        ✕
      </button>
    </div>
  );
}
