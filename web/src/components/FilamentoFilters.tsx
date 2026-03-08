"use client";

import { useState, useMemo } from "react";
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

export default function FilamentoFilters({ filamenti, tipi, brands, famiglie }: Props) {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [brand, setBrand] = useState("");
  const [diametro, setDiametro] = useState("");
  const [famiglia, setFamiglia] = useState("");
  const [prezzoMax, setPrezzoMax] = useState("");
  const [sortBy, setSortBy] = useState<"prezzo" | "brand" | "tipo">("prezzo");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    const result = filamenti.filter((f) => {
      if (tipo && f.tipo !== tipo) return false;
      if (brand && f.brand !== brand) return false;
      if (diametro && String(f.diametro_mm) !== diametro) return false;
      if (famiglia && f.colore_famiglia !== famiglia) return false;
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
      if (sortBy === "brand") return `${a.brand}${a.variante}`.localeCompare(`${b.brand}${b.variante}`);
      return `${a.tipo}${a.variante}`.localeCompare(`${b.tipo}${b.variante}`);
    });
  }, [filamenti, q, tipo, brand, diametro, famiglia, prezzoMax, sortBy]);

  return (
    <div>
      {/* Filtri */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Cerca filamento..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${sel} w-44`}
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={sel}>
          <option value="">Tutti i tipi</option>
          {tipi.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={sel}>
          <option value="">Tutti i brand</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={diametro} onChange={(e) => setDiametro(e.target.value)} className={sel}>
          <option value="">Tutti i diametri</option>
          <option value="1.75">1.75 mm</option>
          <option value="2.85">2.85 mm</option>
        </select>
        <select value={famiglia} onChange={(e) => setFamiglia(e.target.value)} className={sel}>
          <option value="">Tutti i colori</option>
          {famiglie.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          placeholder="Max €/kg"
          value={prezzoMax}
          onChange={(e) => setPrezzoMax(e.target.value)}
          className={`${sel} w-28`}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={sel}>
          <option value="prezzo">€/kg ↑</option>
          <option value="brand">Brand A-Z</option>
          <option value="tipo">Tipo A-Z</option>
        </select>
        {(q || tipo || brand || diametro || famiglia || prezzoMax) && (
          <button
            onClick={() => { setQ(""); setTipo(""); setBrand(""); setDiametro(""); setFamiglia(""); setPrezzoMax(""); }}
            className="text-zinc-500 hover:text-zinc-300 text-sm px-2 transition-colors"
          >
            ✕ Reset
          </button>
        )}

        {/* Toggle vista griglia / tabella */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setView("grid")}
            title="Vista griglia"
            className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button
            onClick={() => setView("table")}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800 text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">Filamento</th>
                <th className="pb-3 pr-4">Colore</th>
                <th className="pb-3 pr-4">Peso</th>
                <th className="pb-3 pr-4">Diametro</th>
                <th className="pb-3 pr-4">Prezzo min</th>
                <th className="pb-3 pr-4 text-emerald-400">€ / kg</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
                const prezzoMin = f.prezzo_min ? `€ ${Number(f.prezzo_min).toFixed(2)}` : null;
                const prezzoKg = f.prezzo_per_kg_min ? `€ ${Number(f.prezzo_per_kg_min).toFixed(2)}` : null;

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
                    <td className="py-2.5 pr-4 text-zinc-400">{f.peso_g}g</td>
                    <td className="py-2.5 pr-4 text-zinc-500 text-xs">⌀ {f.diametro_mm} mm</td>
                    <td className="py-2.5 pr-4 text-zinc-100">
                      {prezzoMin ?? <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-2.5 pr-4">
                      {prezzoKg
                        ? <span className="text-emerald-400 font-bold">{prezzoKg}/kg</span>
                        : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-2.5 text-right">
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
      )}
    </div>
  );
}
