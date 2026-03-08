"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import FilamentoCard from "./FilamentoCard";
import FilamentoTable from "./FilamentoTable";

interface Props {
  filamenti: FilamentoRow[];
  tipi: string[];
  brands: string[];
  famiglie: string[];
}

const sel =
  "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500";

type SortKey = "prezzo" | "brand" | "tipo" | "colore" | "peso" | "prezzo_min";

const TYPE_PILL: Record<string, string> = {
  "PLA":     "border-emerald-700/60 text-emerald-400 data-[active]:bg-emerald-900/50 data-[active]:border-emerald-600",
  "PLA-CF":  "border-teal-700/60 text-teal-300 data-[active]:bg-teal-900/50 data-[active]:border-teal-600",
  "PETG":    "border-blue-700/60 text-blue-400 data-[active]:bg-blue-900/50 data-[active]:border-blue-600",
  "PETG-CF": "border-blue-700/60 text-blue-300 data-[active]:bg-blue-900/50 data-[active]:border-blue-600",
  "ABS":     "border-orange-700/60 text-orange-400 data-[active]:bg-orange-900/50 data-[active]:border-orange-600",
  "ASA":     "border-amber-700/60 text-amber-400 data-[active]:bg-amber-900/50 data-[active]:border-amber-600",
  "TPU":     "border-purple-700/60 text-purple-400 data-[active]:bg-purple-900/50 data-[active]:border-purple-600",
  "NYLON":   "border-cyan-700/60 text-cyan-400 data-[active]:bg-cyan-900/50 data-[active]:border-cyan-600",
  "PA-CF":   "border-cyan-700/60 text-cyan-300 data-[active]:bg-cyan-900/50 data-[active]:border-cyan-600",
  "PC":      "border-red-700/60 text-red-400 data-[active]:bg-red-900/50 data-[active]:border-red-600",
  "HIPS":    "border-zinc-600/60 text-zinc-300 data-[active]:bg-zinc-800 data-[active]:border-zinc-500",
  "PVA":     "border-pink-700/60 text-pink-400 data-[active]:bg-pink-900/50 data-[active]:border-pink-600",
};

export default function FilamentoFilters({ filamenti, tipi, brands, famiglie }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q        = params.get("q")        ?? "";
  const tipo     = params.get("tipo")     ?? "";
  const brand    = params.get("brand")    ?? "";
  const diametro = params.get("diametro") ?? "";
  const famiglia = params.get("colore")   ?? "";
  const peso     = params.get("peso")     ?? "";
  const prezzoMax= params.get("maxkg")    ?? "";
  const sortBy   = (params.get("sort")   ?? "prezzo") as SortKey;
  const view     = (params.get("view")   ?? "grid")   as "grid" | "table";

  // Local state for debounced search
  const [localQ, setLocalQ] = useState(q);

  // Sync when URL param changes (e.g. reset)
  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  // Debounced URL update
  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  useEffect(() => {
    const t = setTimeout(() => setParam("q", localQ), 300);
    return () => clearTimeout(t);
  }, [localQ, setParam]);

  const resetAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const filtered = useMemo(() => {
    const result = filamenti.filter((f) => {
      if (tipo && f.tipo !== tipo) return false;
      if (brand && f.brand !== brand) return false;
      if (diametro && String(f.diametro_mm) !== diametro) return false;
      if (famiglia && f.colore_famiglia !== famiglia) return false;
      if (peso && f.peso_g !== Number(peso)) return false;
      if (prezzoMax && f.prezzo_per_kg_min != null && Number(f.prezzo_per_kg_min) > Number(prezzoMax)) return false;
      if (q) {
        const search = q.toLowerCase();
        const text = [f.brand, f.tipo, f.variante, f.colore, f.colore_famiglia]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!text.includes(search)) return false;
      }
      return true;
    });
    // Grid sort only (table handles its own sorting internally via TanStack)
    if (view === "grid") {
      return result.sort((a, b) => {
        if (sortBy === "prezzo") {
          const pa = a.prezzo_per_kg_min != null ? Number(a.prezzo_per_kg_min) : Infinity;
          const pb = b.prezzo_per_kg_min != null ? Number(b.prezzo_per_kg_min) : Infinity;
          return pa - pb;
        }
        if (sortBy === "prezzo_min") {
          const pa = a.prezzo_min != null ? Number(a.prezzo_min) : Infinity;
          const pb = b.prezzo_min != null ? Number(b.prezzo_min) : Infinity;
          return pa - pb;
        }
        if (sortBy === "peso") return (a.peso_g ?? 0) - (b.peso_g ?? 0);
        if (sortBy === "colore") return (a.colore ?? "").localeCompare(b.colore ?? "");
        if (sortBy === "brand") return `${a.brand}${a.variante}`.localeCompare(`${b.brand}${b.variante}`);
        return `${a.tipo}${a.variante}`.localeCompare(`${b.tipo}${b.variante}`);
      });
    }
    return result;
  }, [filamenti, q, tipo, brand, diametro, famiglia, peso, prezzoMax, sortBy, view]);

  const hasFilters = q || tipo || brand || diametro || famiglia || peso || prezzoMax;

  const formatPeso = (p: string) => {
    const n = Number(p);
    return n >= 1000 ? `${n / 1000}kg` : `${n}g`;
  };

  return (
    <div>
      {/* Filtri — sticky */}
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2 pb-3 mb-2 border-b border-zinc-800/60">
      <div className="flex flex-wrap gap-2 mb-2.5">
        <input
          type="text"
          placeholder="Cerca filamento..."
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className={`${sel} w-44`}
        />
        <select value={tipo} onChange={(e) => setParam("tipo", e.target.value)} className={sel}>
          <option value="">Tutti i tipi</option>
          {tipi.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={brand} onChange={(e) => setParam("brand", e.target.value)} className={sel}>
          <option value="">Tutti i brand</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={diametro} onChange={(e) => setParam("diametro", e.target.value)} className={sel}>
          <option value="">Tutti i diametri</option>
          <option value="1.75">1.75 mm</option>
          <option value="2.85">2.85 mm</option>
        </select>
        <select value={peso} onChange={(e) => setParam("peso", e.target.value)} className={sel}>
          <option value="">Tutti i pesi</option>
          <option value="250">250 g</option>
          <option value="500">500 g</option>
          <option value="1000">1 kg</option>
          <option value="2000">2 kg</option>
          <option value="3000">3 kg</option>
          <option value="5000">5 kg</option>
          <option value="10000">10 kg</option>
        </select>
        <select value={famiglia} onChange={(e) => setParam("colore", e.target.value)} className={sel}>
          <option value="">Tutti i colori</option>
          {famiglie.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          placeholder="Max €/kg"
          value={prezzoMax}
          onChange={(e) => setParam("maxkg", e.target.value)}
          className={`${sel} w-28`}
        />
        {view === "grid" && (
          <select value={sortBy} onChange={(e) => setParam("sort", e.target.value)} className={sel}>
            <option value="prezzo">€/kg ↑</option>
            <option value="prezzo_min">Prezzo ↑</option>
            <option value="peso">Peso ↑</option>
            <option value="brand">Brand A-Z</option>
            <option value="tipo">Tipo A-Z</option>
            <option value="colore">Colore A-Z</option>
          </select>
        )}
        {hasFilters && (
          <button
            onClick={resetAll}
            className="text-zinc-500 hover:text-zinc-300 text-sm px-2 transition-colors"
          >
            ✕ Reset
          </button>
        )}

        {/* Toggle vista griglia / tabella */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setParam("view", "grid")}
            title="Vista griglia"
            className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button
            onClick={() => setParam("view", "table")}
            title="Vista tabella"
            className={`p-1.5 rounded-lg transition-colors ${view === "table" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="14" height="3" rx="1"/><rect x="1" y="6" width="14" height="3" rx="1"/>
              <rect x="1" y="11" width="14" height="3" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Quick type pills */}
      {tipi.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none mt-2">
          <button
            onClick={() => setParam("tipo", "")}
            className={`shrink-0 text-xs font-mono px-2.5 py-1 rounded-full border transition-colors ${!tipo ? "bg-zinc-700 border-zinc-500 text-zinc-100" : "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"}`}
          >
            Tutti
          </button>
          {tipi.map((t) => (
            <button
              key={t}
              onClick={() => setParam("tipo", tipo === t ? "" : t)}
              data-active={tipo === t ? "" : undefined}
              className={`shrink-0 text-xs font-mono px-2.5 py-1 rounded-full border transition-colors ${TYPE_PILL[t] ?? "border-zinc-700/60 text-zinc-400 data-[active]:bg-zinc-800 data-[active]:border-zinc-500"}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      </div>{/* end sticky */}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {q && (
            <button
              onClick={() => { setLocalQ(""); setParam("q", ""); }}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              &ldquo;{q}&rdquo; <span className="text-zinc-500">×</span>
            </button>
          )}
          {tipo && (
            <button
              onClick={() => setParam("tipo", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              Tipo: {tipo} <span className="text-zinc-500">×</span>
            </button>
          )}
          {brand && (
            <button
              onClick={() => setParam("brand", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              Brand: {brand} <span className="text-zinc-500">×</span>
            </button>
          )}
          {diametro && (
            <button
              onClick={() => setParam("diametro", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              ⌀ {diametro}mm <span className="text-zinc-500">×</span>
            </button>
          )}
          {famiglia && (
            <button
              onClick={() => setParam("colore", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              Colore: {famiglia} <span className="text-zinc-500">×</span>
            </button>
          )}
          {peso && (
            <button
              onClick={() => setParam("peso", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              {formatPeso(peso)} <span className="text-zinc-500">×</span>
            </button>
          )}
          {prezzoMax && (
            <button
              onClick={() => setParam("maxkg", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              Max €{prezzoMax}/kg <span className="text-zinc-500">×</span>
            </button>
          )}
        </div>
      )}

      {/* Conteggio */}
      <p className="text-sm text-zinc-500 mb-4">
        {filtered.length} filament{filtered.length !== 1 ? "i" : "o"} trovat{filtered.length !== 1 ? "i" : "o"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          Nessun filamento corrisponde ai filtri selezionati.
        </div>
      ) : view === "grid" ? (
        /* ── Vista Griglia ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((f) => (
            <FilamentoCard
              key={slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g)}
              f={f}
            />
          ))}
        </div>
      ) : (
        /* ── Vista Tabella (TanStack Table) ── */
        <FilamentoTable filamenti={filtered} />
      )}
    </div>
  );
}
