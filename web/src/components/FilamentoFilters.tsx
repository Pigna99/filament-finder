"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import FilamentoCard from "./FilamentoCard";

interface Props {
  filamenti: FilamentoRow[];
  tipi: string[];
  brands: string[];
  famiglie: string[];
}

const sel =
  "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500";

type SortKey = "prezzo" | "brand" | "tipo" | "colore" | "peso" | "prezzo_min";

const TABLE_PAGE_SIZE = 25;

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
  const page     = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      // Reset page when changing filters or sort
      if (key !== "page" && key !== "view") next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const resetAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const setSort = useCallback((key: SortKey) => {
    setParam("sort", key);
  }, [setParam]);

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
  }, [filamenti, q, tipo, brand, diametro, famiglia, peso, prezzoMax, sortBy]);

  const hasFilters = q || tipo || brand || diametro || famiglia || peso || prezzoMax;

  // Pagination for table
  const totalPages = Math.ceil(filtered.length / TABLE_PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE);

  function ThSort({ label, sortKey, className }: { label: string; sortKey: SortKey; className?: string }) {
    const active = sortBy === sortKey;
    return (
      <th
        onClick={() => setSort(sortKey)}
        className={`pb-3 pr-4 cursor-pointer select-none hover:text-zinc-300 transition-colors whitespace-nowrap ${active ? "text-emerald-400" : ""} ${className ?? ""}`}
      >
        {label} {active ? "↑" : ""}
      </th>
    );
  }

  return (
    <div>
      {/* Filtri */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Cerca filamento..."
          value={q}
          onChange={(e) => setParam("q", e.target.value)}
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

      {/* Conteggio */}
      <p className="text-sm text-zinc-500 mb-4">
        {filtered.length} filament{filtered.length !== 1 ? "i" : "o"} trovat{filtered.length !== 1 ? "i" : "o"}
        {view === "table" && totalPages > 1 && (
          <span className="ml-2 text-zinc-600">· pag. {page}/{totalPages}</span>
        )}
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
        /* ── Vista Tabella ── */
        <>
          {/* Mobile: card list */}
          <div className="sm:hidden space-y-2">
            {paginated.map((f) => {
              const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
              const prezzoMin = f.prezzo_min ? `€ ${Number(f.prezzo_min).toFixed(2)}` : null;
              const prezzoKg  = f.prezzo_per_kg_min ? `€ ${Number(f.prezzo_per_kg_min).toFixed(2)}/kg` : null;
              return (
                <Link key={slug} href={`/filamento/${slug}`}
                  className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/40 transition-colors"
                >
                  {f.link_immagine
                    ? <img src={f.link_immagine} alt="" className="w-10 h-10 object-contain rounded bg-zinc-800 p-0.5 shrink-0" /> // eslint-disable-line @next/next/no-img-element
                    : f.colore_hex
                      ? <span className="w-10 h-10 rounded-full border-2 border-zinc-700 shrink-0 flex items-center justify-center" style={{ backgroundColor: f.colore_hex }}>
                          <span className="w-3 h-3 rounded-full bg-zinc-900/80" />
                        </span>
                      : <span className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500">{f.brand} · {f.tipo} {f.variante}</p>
                    <p className="text-sm text-zinc-100 truncate">{f.colore ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{f.peso_g}g</p>
                  </div>
                  <div className="text-right shrink-0">
                    {prezzoMin && <p className="text-sm font-bold text-zinc-100">{prezzoMin}</p>}
                    {prezzoKg  && <p className="text-xs text-emerald-400">{prezzoKg}</p>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop: tabella */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-left border-b border-zinc-800 text-xs uppercase tracking-wider">
                  <ThSort label="Filamento" sortKey="brand" />
                  <ThSort label="Colore"    sortKey="colore" />
                  <ThSort label="Peso"      sortKey="peso" />
                  <th className="pb-3 pr-4 text-zinc-500 text-xs uppercase tracking-wider whitespace-nowrap">Diametro</th>
                  <ThSort label="Prezzo min" sortKey="prezzo_min" />
                  <ThSort label="€ / kg"    sortKey="prezzo" className="text-emerald-400" />
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((f) => {
                  const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
                  const prezzoMin = f.prezzo_min ? `€ ${Number(f.prezzo_min).toFixed(2)}` : null;
                  const prezzoKg  = f.prezzo_per_kg_min ? `€ ${Number(f.prezzo_per_kg_min).toFixed(2)}` : null;

                  return (
                    <tr key={slug} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 group">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          {f.link_immagine && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.link_immagine} alt="" className="w-8 h-8 object-contain rounded bg-zinc-800 p-0.5 shrink-0" />
                          )}
                          <div>
                            <span className="text-zinc-100 font-medium">{f.brand}</span>
                            <span className="text-zinc-500"> {f.tipo} {f.variante}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          {f.colore_hex && (
                            <span className="w-3 h-3 rounded-full border border-zinc-700 shrink-0"
                              style={{ backgroundColor: f.colore_hex }} />
                          )}
                          <span className="text-zinc-400 text-xs">{f.colore ?? <span className="text-zinc-600">—</span>}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 whitespace-nowrap">{f.peso_g}g</td>
                      <td className="py-2.5 pr-4 text-zinc-500 text-xs whitespace-nowrap">⌀ {f.diametro_mm} mm</td>
                      <td className="py-2.5 pr-4 text-zinc-100 whitespace-nowrap">
                        {prezzoMin ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        {prezzoKg
                          ? <span className="text-emerald-400 font-bold">{prezzoKg}/kg</span>
                          : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <Link
                          href={`/filamento/${slug}`}
                          className="text-xs text-zinc-500 group-hover:text-emerald-400 transition-colors"
                        >
                          Dettaglio →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginazione */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setParam("page", String(page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prec
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…"
                      ? <span key={`sep-${i}`} className="text-zinc-600 px-1">…</span>
                      : <button
                          key={p}
                          onClick={() => setParam("page", String(p))}
                          className={`w-8 h-8 rounded-lg text-sm transition-colors ${page === p ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                        >
                          {p}
                        </button>
                  )
                }
              </div>
              <button
                onClick={() => setParam("page", String(page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Succ →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
