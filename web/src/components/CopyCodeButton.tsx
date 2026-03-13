"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm font-bold text-emerald-400 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 tracking-wider">
        {code}
      </span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
      >
        {copied ? "✓ Copiato!" : "Copia"}
      </button>
    </div>
  );
}
