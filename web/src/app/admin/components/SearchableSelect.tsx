"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Cerca...", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function handleSelect(opt: SelectOption) {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  }

  function handleOpen() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 hover:border-zinc-500 transition-colors focus:outline-none focus:border-emerald-500 truncate"
      >
        {selected ? selected.label : <span className="text-zinc-500">{placeholder}</span>}
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-zinc-700">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cerca filamento..."
              className="w-full px-2 py-1.5 text-sm bg-zinc-800 border border-zinc-600 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-zinc-500">Nessun risultato</li>
            ) : (
              filtered.map(opt => (
                <li
                  key={opt.value}
                  onMouseDown={() => handleSelect(opt)}
                  className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                    opt.value === value
                      ? "bg-emerald-900/50 text-emerald-300"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
          {filtered.length > 0 && (
            <div className="px-3 py-1 border-t border-zinc-700 text-xs text-zinc-600">
              {filtered.length} risultati{query ? ` per "${query}"` : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
