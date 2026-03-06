"use client";
import { useState } from "react";

interface FieldProps {
  label: string;
  tooltip?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, tooltip, required, children, className }: FieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      <label className="flex items-center gap-1 text-xs font-medium text-zinc-400 mb-1.5">
        {label}
        {required && <span className="text-red-400">*</span>}
        {tooltip && (
          <span
            className="relative ml-0.5"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
          >
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-zinc-700 text-zinc-400 text-[10px] cursor-help select-none">
              ?
            </span>
            {show && (
              <span className="absolute left-0 bottom-full mb-1.5 w-56 bg-zinc-800 border border-zinc-600 text-zinc-300 text-xs rounded-xl p-2.5 z-50 shadow-xl pointer-events-none leading-relaxed">
                {tooltip}
              </span>
            )}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export const inp = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 w-full";
export const sel = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 w-full";
