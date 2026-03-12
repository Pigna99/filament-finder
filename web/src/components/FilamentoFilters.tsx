"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
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

// Colore famiglia → hex rappresentativo
const FAMIGLIA_HEX: Record<string, string> = {
  nero:        "#1a1a1a",
  bianco:      "#f0f0f0",
  grigio:      "#808080",
  rosso:       "#cc0000",
  blu:         "#0033cc",
  verde:       "#008000",
  giallo:      "#ffdd00",
  arancio:     "#ff6600",
  viola:       "#660099",
  marrone:     "#8b4513",
  trasparente: "#e8f4f8",
  multicolor:  "multicolor",
};

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

  const q          = params.get("q")          ?? "";
  const tipo       = params.get("tipo")       ?? "";
  const brand      = params.get("brand")      ?? "";
  const diametro   = params.get("diametro")   ?? "";
  const famiglia   = params.get("colore")     ?? "";
  const peso       = params.get("peso")       ?? "";
  const prezzoMax  = params.get("maxkg")      ?? "";
  const prezzoEur  = params.get("maxeur")     ?? "";
  const refill     = params.get("refill")     ?? "";
  const disponibile= params.get("disponibile")?? "";
  const sortBy     = (params.get("sort")      ?? "prezzo") as SortKey;
  const view       = (params.get("view")      ?? "grid")   as "grid" | "table";

  // Local state for debounced search
  const [localQ, setLocalQ] = useState(q);
  // Mobile filters toggle
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Server-filtered results (replaces client useMemo filtering)
  const [fetchedFilamenti, setFetchedFilamenti] = useState<FilamentoRow[]>(filamenti);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);
  // Infinite scroll
  const PAGE_SIZE = 48;
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  // Fetch from API when filter params change (server-side filtering)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // Server pre-filters only tipo+brand. If other filters active on mount, fetch now.
      const needsInitialFetch = q || diametro || famiglia || peso || prezzoMax || prezzoEur || refill || disponibile;
      if (!needsInitialFetch) return;
    }

    const controller = new AbortController();
    setLoading(true);

    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (tipo) sp.set("tipo", tipo);
    if (brand) sp.set("brand", brand);
    if (diametro) sp.set("diametro", diametro);
    if (famiglia) sp.set("famiglia", famiglia);
    if (peso) sp.set("peso", peso);
    if (prezzoMax) sp.set("prezzo_max", prezzoMax);
    if (prezzoEur) sp.set("maxeur", prezzoEur);
    if (refill) sp.set("refill", refill);
    if (disponibile) sp.set("disponibile", disponibile);

    fetch(`/api/filamenti?${sp.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: FilamentoRow[]) => setFetchedFilamenti(data))
      .catch((e) => { if (e.name !== "AbortError") console.error(e); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [q, tipo, brand, diametro, famiglia, peso, prezzoMax, prezzoEur, refill, disponibile]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
    setFetchedFilamenti(filamenti);
    setDisplayCount(PAGE_SIZE);
  }, [pathname, router, filamenti, PAGE_SIZE]);

  // Client-side sort only (filtering is done server-side)
  const filtered = useMemo(() => {
    if (view !== "grid") return fetchedFilamenti;
    return [...fetchedFilamenti].sort((a, b) => {
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
  }, [fetchedFilamenti, sortBy, view]);

  // Reset display count when filtered results change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [filtered, PAGE_SIZE]);

  // Infinite scroll: observe sentinel at bottom of grid
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }); // runs after every render — sentinel re-observed as list grows

  const hasFilters = q || tipo || brand || diametro || famiglia || peso || prezzoMax || prezzoEur || refill || disponibile;

  const formatPeso = (p: string) => {
    const n = Number(p);
    return n >= 1000 ? `${n / 1000}kg` : `${n}g`;
  };

  return (
    <div>
      {/* Filtri — sticky */}
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2 pb-3 mb-2 border-b border-zinc-800/60">

        {/* Barra compatta mobile (sempre visibile) */}
        <div className="flex items-center gap-2 sm:hidden mb-2">
          <input
            type="text"
            placeholder="Cerca filamento..."
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            className={`${sel} flex-1 min-w-0`}
          />
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-1.5 shrink-0 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              filtersOpen || hasFilters
                ? "bg-emerald-900/50 border-emerald-700 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-300"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
            </svg>
            Filtri
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
          {/* Toggle vista — mobile */}
          <div className="flex items-center gap-1 shrink-0">
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

        {/* Pannello filtri completo — desktop sempre visibile, mobile collassabile */}
        <div className={`${filtersOpen ? "block" : "hidden"} sm:block`}>
          <div className="flex flex-wrap gap-2 mb-2.5">
            <input
              type="text"
              placeholder="Cerca filamento..."
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              className={`${sel} w-44 hidden sm:block`}
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
            {/* Color swatches */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {famiglie.map((c) => {
                const hex = FAMIGLIA_HEX[c];
                const isActive = famiglia === c;
                return (
                  <button
                    key={c}
                    onClick={() => setParam("colore", isActive ? "" : c)}
                    title={c.charAt(0).toUpperCase() + c.slice(1)}
                    className={`relative w-6 h-6 rounded-full border-2 transition-all ${
                      isActive ? "border-emerald-400 scale-110" : "border-zinc-700 hover:border-zinc-400"
                    }`}
                    style={
                      hex === "multicolor"
                        ? { background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }
                        : { backgroundColor: hex ?? "#808080" }
                    }
                  >
                    {hex === "#f0f0f0" || hex === "#ffdd00" || hex === "#e8f4f8" ? (
                      <span className="sr-only">{c}</span>
                    ) : null}
                  </button>
                );
              })}
              {famiglia && (
                <button
                  onClick={() => setParam("colore", "")}
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-1 transition-colors"
                  title="Reset colore"
                >
                  ✕
                </button>
              )}
            </div>
            <input
              type="number"
              placeholder="Max €/kg"
              value={prezzoMax}
              onChange={(e) => setParam("maxkg", e.target.value)}
              className={`${sel} w-28`}
            />
            <input
              type="number"
              placeholder="Max €"
              value={prezzoEur}
              onChange={(e) => setParam("maxeur", e.target.value)}
              className={`${sel} w-24`}
            />
            {/* Toggle disponibile */}
            <button
              onClick={() => setParam("disponibile", disponibile === "1" ? "" : "1")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                disponibile === "1"
                  ? "bg-emerald-900/50 border-emerald-700 text-emerald-400"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${disponibile === "1" ? "bg-emerald-400" : "bg-zinc-600"}`} />
              Disponibili
            </button>
            {/* Toggle refill */}
            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1">
              <button
                onClick={() => setParam("refill", refill === "no" ? "" : "no")}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${refill === "no" ? "bg-zinc-600 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Con bobina
              </button>
              <button
                onClick={() => setParam("refill", refill === "yes" ? "" : "yes")}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${refill === "yes" ? "bg-amber-700 text-amber-100" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                Refill
              </button>
            </div>

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

            {/* Toggle vista griglia / tabella — desktop */}
            <div className="ml-auto hidden sm:flex items-center gap-1">
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
        </div>
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
              className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              {FAMIGLIA_HEX[famiglia] && FAMIGLIA_HEX[famiglia] !== "multicolor" && (
                <span
                  className="w-3 h-3 rounded-full border border-zinc-600 inline-block shrink-0"
                  style={{ backgroundColor: FAMIGLIA_HEX[famiglia] }}
                />
              )}
              {famiglia.charAt(0).toUpperCase() + famiglia.slice(1)} <span className="text-zinc-500">×</span>
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
          {prezzoEur && (
            <button
              onClick={() => setParam("maxeur", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              Max €{prezzoEur} <span className="text-zinc-500">×</span>
            </button>
          )}
          {disponibile === "1" && (
            <button
              onClick={() => setParam("disponibile", "")}
              className="flex items-center gap-1.5 bg-emerald-900/50 text-emerald-300 text-xs px-2 py-1 rounded-full hover:bg-emerald-900 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Solo disponibili <span className="text-emerald-600">×</span>
            </button>
          )}
          {refill === "yes" && (
            <button
              onClick={() => setParam("refill", "")}
              className="flex items-center gap-1 bg-amber-900/60 text-amber-300 text-xs px-2 py-1 rounded-full hover:bg-amber-900 transition-colors"
            >
              Solo Refill <span className="text-amber-600">×</span>
            </button>
          )}
          {refill === "no" && (
            <button
              onClick={() => setParam("refill", "")}
              className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full hover:bg-zinc-700 transition-colors"
            >
              Solo con bobina <span className="text-zinc-500">×</span>
            </button>
          )}
        </div>
      )}

      {/* Conteggio + loading */}
      <p className="text-sm text-zinc-500 mb-4 flex items-center gap-2">
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin" />
            Caricamento…
          </>
        ) : (
          <>{filtered.length} filament{filtered.length !== 1 ? "i" : "o"} trovat{filtered.length !== 1 ? "i" : "o"}</>
        )}
      </p>

      {!loading && filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          Nessun filamento corrisponde ai filtri selezionati.
        </div>
      ) : view === "grid" ? (
        /* ── Vista Griglia con infinite scroll ── */
        <>
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity ${loading ? "opacity-40 pointer-events-none" : ""}`}>
            {filtered.slice(0, displayCount).map((f) => (
              <FilamentoCard key={f.id} f={f} />
            ))}
          </div>
          {/* Sentinel: trigger per caricare altri item */}
          {displayCount < filtered.length && (
            <div ref={sentinelRef} className="flex justify-center items-center py-8 mt-2">
              <span className="inline-block w-5 h-5 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          )}
        </>
      ) : (
        /* ── Vista Tabella (TanStack Table) ── */
        <div className={`transition-opacity ${loading ? "opacity-40 pointer-events-none" : ""}`}>
          <FilamentoTable filamenti={filtered} />
        </div>
      )}
    </div>
  );
}
