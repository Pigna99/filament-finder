"use client";
import { useEffect } from "react";

interface Props {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ title, onClose, onSave, saving, saveLabel = "Salva", children, size = "md" }: Props) {
  const sizeClass = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="font-semibold text-zinc-100">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">{children}</div>
        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-sm px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors">
            Annulla
          </button>
          <button onClick={onSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
            {saving ? "Salvo..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
