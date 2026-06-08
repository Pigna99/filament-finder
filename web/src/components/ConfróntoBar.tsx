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
    <div
      className="ff-rise fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 border rounded-2xl px-5 py-3 shadow-2xl"
      style={{
        backgroundColor: "var(--surface-2)",
        borderColor: "var(--accent-line)",
        boxShadow: "0 12px 40px oklch(0 0 0 / 0.5)",
      }}
      role="region"
      aria-label="Filamenti selezionati per il confronto"
    >
      <span className="text-sm" style={{ color: "var(--ink-2)" }}>
        <span className="font-semibold" style={{ color: "var(--accent)" }}>{ids.length}</span> filamenti selezionati
      </span>
      <button
        onClick={() => router.push(`/confronta?ids=${ids.join(",")}`)}
        className="text-sm font-medium px-4 py-1.5 rounded-xl transition-colors"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
      >
        Confronta →
      </button>
      <button
        onClick={() => setCompareIds([])}
        className="text-sm px-2 transition-colors"
        style={{ color: "var(--ink-4)" }}
        aria-label="Svuota selezione"
        title="Svuota selezione"
      >
        ✕
      </button>
    </div>
  );
}
