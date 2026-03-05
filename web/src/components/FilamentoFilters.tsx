"use client";

import { useState, useMemo } from "react";
import { FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import FilamentoCard from "./FilamentoCard";

interface Props {
  filamenti: FilamentoRow[];
  tipi: string[];
  brands: string[];
  famiglie: string[];
}

export default function FilamentoFilters({ filamenti, tipi, brands, famiglie }: Props) {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [brand, setBrand] = useState("");
  const [diametro, setDiametro] = useState("");
  const [famiglia, setFamiglia] = useState("");
  const [prezzoMax, setPrezzoMax] = useState("");
  const [sortBy, setSortBy] = useState<"prezzo" | "brand" | "tipo">("prezzo");

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

  const selectClass =
    "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500";

  return (
    <div>
      {/* Filtri */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Cerca filamento..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-48"
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass}>
          <option value="">Tutti i tipi</option>
          {tipi.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
          <option value="">Tutti i brand</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={diametro} onChange={(e) => setDiametro(e.target.value)} className={selectClass}>
          <option value="">Tutti i diametri</option>
          <option value="1.75">1.75 mm</option>
          <option value="2.85">2.85 mm</option>
        </select>
        <select value={famiglia} onChange={(e) => setFamiglia(e.target.value)} className={selectClass}>
          <option value="">Tutti i colori</option>
          {famiglie.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Max €/kg"
          value={prezzoMax}
          onChange={(e) => setPrezzoMax(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-28"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={selectClass}>
          <option value="prezzo">Ordina: €/kg</option>
          <option value="brand">Ordina: Brand</option>
          <option value="tipo">Ordina: Tipo</option>
        </select>
        {(q || tipo || brand || diametro || famiglia || prezzoMax) && (
          <button
            onClick={() => { setQ(""); setTipo(""); setBrand(""); setDiametro(""); setFamiglia(""); setPrezzoMax(""); }}
            className="text-zinc-500 hover:text-zinc-300 text-sm px-2 transition-colors"
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* Risultati */}
      <p className="text-sm text-zinc-500 mb-4">
        {filtered.length} filament{filtered.length !== 1 ? "i" : "o"} trovat{filtered.length !== 1 ? "i" : "o"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          Nessun filamento corrisponde ai filtri selezionati.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((f) => (
            <FilamentoCard
              key={slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g)}
              f={f}
            />
          ))}
        </div>
      )}
    </div>
  );
}
