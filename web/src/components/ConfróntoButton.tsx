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

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(id); }}
      disabled={full}
      title={active ? "Rimuovi dal confronto" : full ? "Massimo 4 filamenti" : "Aggiungi al confronto"}
      className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-all ${
        active
          ? "bg-emerald-600 border-emerald-500 text-white"
          : full
          ? "bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed"
          : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:border-emerald-600 hover:text-emerald-400 hover:bg-zinc-800"
      }`}
    >
      {active ? "✓" : "+"}
    </button>
  );
}
