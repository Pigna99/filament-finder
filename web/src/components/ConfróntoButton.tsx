"use client";

import { useEffect, useState, useCallback } from "react";
import { toggleCompare, isInCompare, getCompareIds, onCompareChange } from "@/lib/compare";

interface Props {
  id: number;
}

export default function ConfróntoButton({ id }: Props) {
  const [active, setActive] = useState(false);
  const [full, setFull]     = useState(false);

  const sync = useCallback(() => {
    setActive(isInCompare(id));
    setFull(getCompareIds().length >= 4 && !isInCompare(id));
  }, [id]);

  useEffect(() => {
    sync();
    return onCompareChange(sync);
  }, [sync]);

  const label = active
    ? "Rimuovi dal confronto"
    : full
    ? "Massimo 4 filamenti"
    : "Aggiungi al confronto";

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(id); }}
      disabled={full}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium border transition-colors disabled:cursor-not-allowed"
      style={
        active
          ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-ink)" }
          : full
          ? { backgroundColor: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink-4)" }
          : {
              backgroundColor: "color-mix(in oklab, var(--surface-2) 85%, transparent)",
              borderColor: "var(--line-strong)",
              color: "var(--ink-3)",
            }
      }
    >
      {active ? "✓" : "+"}
    </button>
  );
}
