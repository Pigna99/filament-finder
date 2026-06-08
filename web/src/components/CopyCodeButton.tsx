"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span
        className="font-mono text-sm font-bold px-3 py-1.5 rounded-lg border tracking-wider"
        style={{ color: "var(--accent)", backgroundColor: "var(--surface-2)", borderColor: "var(--accent-line)" }}
      >
        {code}
      </span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        aria-label={`Copia il codice ${code}`}
        className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border"
        style={{ backgroundColor: "var(--surface-3)", color: "var(--ink-1)", borderColor: "var(--line-strong)" }}
      >
        {copied ? "✓ Copiato!" : "Copia"}
      </button>
    </div>
  );
}
