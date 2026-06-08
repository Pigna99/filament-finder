"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilamentoRow } from "@/lib/filamenti";
import FilamentoCard from "./FilamentoCard";
import FilamentoTable from "./FilamentoTable";
import Icon from "./Icon";
import { tipoPillStyle } from "@/lib/tipo-style";

interface Props {
  filamenti: FilamentoRow[];
  tipi: string[];
  brands: string[];
  famiglie: string[];
}

const sel =
  "border text-sm rounded-lg px-3 py-1.5 [background-color:var(--surface-2)] [border-color:var(--line-strong)] [color:var(--ink-1)]";

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
      <div
        className="sticky top-16 z-40 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2 pb-3 mb-2 border-b"
        style={{
          backgroundColor: "color-mix(in oklab, var(--surface-0) 92%, transparent)",
          borderColor: "var(--line)",
        }}
      >

        {/* Barra compatta mobile (sempre visibile) */}
        <div className="flex items-center gap-2 sm:hidden mb-2">
          <input
            type="text"
            placeholder="Cerca filamento..."
            aria-label="Cerca filamento"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            className={`${sel} flex-1 min-w-0`}
          />
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="flex items-center gap-1.5 shrink-0 text-sm px-3 py-1.5 rounded-lg border transition-colors"
            style={
              filtersOpen || hasFilters
                ? { backgroundColor: "var(--accent-quiet)", borderColor: "var(--accent-line)", color: "var(--accent)" }
                : { backgroundColor: "var(--surface-2)", borderColor: "var(--line-strong)", color: "var(--ink-2)" }
            }
          >
            <Icon name="sliders" size={16} />
            Filtri
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />}
          </button>
          {/* Toggle vista — mobile */}
          <ViewToggle view={view} setParam={setParam} />
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
                    aria-label={`Colore ${c}`}
                    aria-pressed={isActive}
                    className="relative w-6 h-6 rounded-full border-2 transition-transform hover:scale-105"
                    style={{
                      transform: isActive ? "scale(1.12)" : undefined,
                      borderColor: isActive ? "var(--accent)" : "var(--line-strong)",
                      ...(hex === "multicolor"
                        ? { background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }
                        : { backgroundColor: hex ?? "#808080" }),
                    }}
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
                  className="text-xs px-1 transition-colors"
                  style={{ color: "var(--ink-4)" }}
                  title="Reset colore"
                  aria-label="Reset colore"
                >
                  ✕
                </button>
              )}
            </div>
            <input
              type="number"
              placeholder="Max €/kg"
              aria-label="Prezzo massimo per kg"
              value={prezzoMax}
              onChange={(e) => setParam("maxkg", e.target.value)}
              className={`${sel} w-28`}
            />
            <input
              type="number"
              placeholder="Max €"
              aria-label="Prezzo massimo"
              value={prezzoEur}
              onChange={(e) => setParam("maxeur", e.target.value)}
              className={`${sel} w-24`}
            />
            {/* Toggle disponibile */}
            <button
              onClick={() => setParam("disponibile", disponibile === "1" ? "" : "1")}
              aria-pressed={disponibile === "1"}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={
                disponibile === "1"
                  ? { backgroundColor: "var(--good-quiet)", borderColor: "var(--good)", color: "var(--good)" }
                  : { backgroundColor: "var(--surface-2)", borderColor: "var(--line-strong)", color: "var(--ink-3)" }
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: disponibile === "1" ? "var(--good)" : "var(--ink-4)" }}
              />
              Disponibili
            </button>
            {/* Toggle refill */}
            <div
              className="flex items-center gap-1 border rounded-lg px-2 py-1"
              style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--line-strong)" }}
            >
              <button
                onClick={() => setParam("refill", refill === "no" ? "" : "no")}
                aria-pressed={refill === "no"}
                className="text-xs px-2 py-0.5 rounded transition-colors"
                style={refill === "no"
                  ? { backgroundColor: "var(--surface-3)", color: "var(--ink-1)" }
                  : { color: "var(--ink-4)" }}
              >
                Con bobina
              </button>
              <button
                onClick={() => setParam("refill", refill === "yes" ? "" : "yes")}
                aria-pressed={refill === "yes"}
                className="text-xs px-2 py-0.5 rounded transition-colors"
                style={refill === "yes"
                  ? { backgroundColor: "oklch(0.4 0.08 75)", color: "oklch(0.92 0.06 75)" }
                  : { color: "var(--ink-4)" }}
              >
                Refill
              </button>
            </div>

            {view === "grid" && (
              <select value={sortBy} onChange={(e) => setParam("sort", e.target.value)} aria-label="Ordina per" className={sel}>
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
                className="text-sm px-2 transition-colors"
                style={{ color: "var(--ink-4)" }}
              >
                ✕ Reset
              </button>
            )}

            {/* Toggle vista griglia / tabella — desktop */}
            <div className="ml-auto hidden sm:flex">
              <ViewToggle view={view} setParam={setParam} />
            </div>
          </div>

          {/* Quick type pills */}
          {tipi.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none mt-2">
              <button
                onClick={() => setParam("tipo", "")}
                aria-pressed={!tipo}
                className="shrink-0 text-xs font-mono px-2.5 py-1 rounded-full border transition-colors"
                style={!tipo
                  ? { backgroundColor: "var(--surface-3)", borderColor: "var(--line-strong)", color: "var(--ink-1)" }
                  : { borderColor: "var(--line-strong)", color: "var(--ink-4)" }}
              >
                Tutti
              </button>
              {tipi.map((t) => (
                <button
                  key={t}
                  onClick={() => setParam("tipo", tipo === t ? "" : t)}
                  aria-pressed={tipo === t}
                  className="shrink-0 text-xs font-mono px-2.5 py-1 rounded-full border transition-colors"
                  style={tipoPillStyle(t, tipo === t)}
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
          {q && <Chip onClear={() => { setLocalQ(""); setParam("q", ""); }}>&ldquo;{q}&rdquo;</Chip>}
          {tipo && <Chip onClear={() => setParam("tipo", "")}>Tipo: {tipo}</Chip>}
          {brand && <Chip onClear={() => setParam("brand", "")}>Brand: {brand}</Chip>}
          {diametro && <Chip onClear={() => setParam("diametro", "")}>⌀ {diametro}mm</Chip>}
          {famiglia && (
            <Chip onClear={() => setParam("colore", "")}>
              {FAMIGLIA_HEX[famiglia] && FAMIGLIA_HEX[famiglia] !== "multicolor" && (
                <span
                  className="w-3 h-3 rounded-full border inline-block shrink-0"
                  style={{ backgroundColor: FAMIGLIA_HEX[famiglia], borderColor: "var(--line-strong)" }}
                />
              )}
              {famiglia.charAt(0).toUpperCase() + famiglia.slice(1)}
            </Chip>
          )}
          {peso && <Chip onClear={() => setParam("peso", "")}>{formatPeso(peso)}</Chip>}
          {prezzoMax && <Chip onClear={() => setParam("maxkg", "")}>Max €{prezzoMax}/kg</Chip>}
          {prezzoEur && <Chip onClear={() => setParam("maxeur", "")}>Max €{prezzoEur}</Chip>}
          {disponibile === "1" && (
            <Chip onClear={() => setParam("disponibile", "")} tone="good">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--good)" }} />
              Solo disponibili
            </Chip>
          )}
          {refill === "yes" && <Chip onClear={() => setParam("refill", "")} tone="warn">Solo Refill</Chip>}
          {refill === "no" && <Chip onClear={() => setParam("refill", "")}>Solo con bobina</Chip>}
        </div>
      )}

      {/* Conteggio + loading */}
      <p className="text-sm mb-4 flex items-center gap-2" style={{ color: "var(--ink-3)" }} aria-live="polite">
        {loading ? (
          <>
            <Spinner size={14} />
            Caricamento…
          </>
        ) : (
          <>{filtered.length} filament{filtered.length !== 1 ? "i" : "o"} trovat{filtered.length !== 1 ? "i" : "o"}</>
        )}
      </p>

      {!loading && filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--ink-3)" }}>
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
              <Spinner size={20} />
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

/** Token-driven loading spinner. */
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        border: "2px solid var(--line-strong)",
        borderTopColor: "var(--accent)",
      }}
    />
  );
}

/** Active-filter chip with a clear affordance. */
function Chip({
  children,
  onClear,
  tone = "neutral",
}: {
  children: React.ReactNode;
  onClear: () => void;
  tone?: "neutral" | "good" | "warn";
}) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: { backgroundColor: "var(--surface-2)", color: "var(--ink-2)" },
    good: { backgroundColor: "var(--good-quiet)", color: "var(--good)" },
    warn: { backgroundColor: "oklch(0.34 0.07 75)", color: "oklch(0.88 0.07 75)" },
  };
  return (
    <button
      onClick={onClear}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
      style={styles[tone]}
      aria-label="Rimuovi filtro"
    >
      {children} <span style={{ opacity: 0.6 }}>×</span>
    </button>
  );
}

/** Grid / table view switch — shared by mobile and desktop bars. */
function ViewToggle({
  view,
  setParam,
}: {
  view: "grid" | "table";
  setParam: (key: string, value: string) => void;
}) {
  const btn = (active: boolean): React.CSSProperties =>
    active
      ? { backgroundColor: "var(--accent)", color: "var(--accent-ink)" }
      : { color: "var(--ink-4)" };
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => setParam("view", "grid")}
        aria-label="Vista griglia"
        aria-pressed={view === "grid"}
        className="grid place-items-center w-8 h-8 rounded-lg transition-colors"
        style={btn(view === "grid")}
      >
        <Icon name="grid" size={16} />
      </button>
      <button
        onClick={() => setParam("view", "table")}
        aria-label="Vista tabella"
        aria-pressed={view === "table"}
        className="grid place-items-center w-8 h-8 rounded-lg transition-colors"
        style={btn(view === "table")}
      >
        <Icon name="rows" size={16} />
      </button>
    </div>
  );
}
