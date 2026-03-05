"use client";

import { useEffect, useState } from "react";

interface Props { secret: string }

const TABLES: { key: string; label: string; desc: string }[] = [
  { key: "brand",                    label: "brand",                    desc: "Produttori di filamenti" },
  { key: "filament_type",            label: "filament_type",            desc: "Tipi di materiale (PLA, PETG...)" },
  { key: "filament_variant",         label: "filament_variant",         desc: "Varianti per tipo (Matte, Silk...)" },
  { key: "filament",                 label: "filament",                 desc: "Prodotti specifici acquistabili" },
  { key: "tag",                      label: "tag",                      desc: "Caratteristiche speciali" },
  { key: "filament_tag",             label: "filament_tag",             desc: "Associazione filamento ↔ tag" },
  { key: "printer_profile",          label: "printer_profile",          desc: "Modelli di stampante" },
  { key: "filament_variant_printer", label: "filament_variant_printer", desc: "Compatibilità variante ↔ stampante" },
  { key: "shop",                     label: "shop",                     desc: "Negozi online" },
  { key: "filament_shop",            label: "filament_shop",            desc: "Link acquisto filamento ↔ shop" },
  { key: "price_history",            label: "price_history",            desc: "Storico rilevazioni prezzi" },
];

const ERD = `
  brand ─────────────────────────── filament ──── filament_tag ──── tag
                                        │
  filament_type ── filament_variant ────┘
                          │
                  filament_variant_printer ──── printer_profile

  filament ──── filament_shop ──── shop
                     │
                price_history

  ── VIEWS ──────────────────────────────────────────────────────
  v_filament_props      → proprietà effettive (COALESCE variante/tipo)
  v_price_latest        → ultimo prezzo per link + €/kg calcolato
  v_filament_full       → catalogo completo con miglior prezzo
  v_price_history_full  → storico con contesto (per grafici)
`.trim();

export default function DatabaseTab({ secret }: Props) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/db-status?secret=${secret}`)
      .then(r => r.json())
      .then(d => { setCounts(d.counts); setLoading(false); });
  }, [secret]);

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-6">Struttura Database</h2>

      {/* ERD */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Schema ER</h3>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
          {ERD}
        </pre>
      </div>

      {/* Statistiche tabelle */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">
          Record per tabella
          {!loading && <span className="text-zinc-600 font-normal ml-2">({total.toLocaleString("it-IT")} totali)</span>}
        </h3>

        {loading ? (
          <p className="text-zinc-500 text-sm">Caricamento...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TABLES.map(({ key, label, desc }) => {
              const count = counts?.[key] ?? 0;
              const maxCount = Math.max(...Object.values(counts ?? {}), 1);
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs text-emerald-400 font-mono">{label}</code>
                    <span className="text-lg font-bold text-zinc-100">{count.toLocaleString("it-IT")}</span>
                  </div>
                  <p className="text-xs text-zinc-600 mb-2">{desc}</p>
                  {/* Mini progress bar */}
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/50 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info views */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Views SQL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { nome: "v_filament_props", desc: "Proprietà tecniche effettive con ereditarietà COALESCE(variante, tipo)" },
            { nome: "v_price_latest", desc: "Ultimo prezzo per ogni link attivo + prezzo_finale e €/kg calcolati con LATERAL" },
            { nome: "v_filament_full", desc: "Vista catalogo completa: filamento + brand + tipo/variante + miglior prezzo" },
            { nome: "v_price_history_full", desc: "Storico completo con contesto (brand, tipo, shop) per i grafici prezzi" },
          ].map(v => (
            <div key={v.nome} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <code className="text-sm text-blue-400 font-mono">{v.nome}</code>
              <p className="text-xs text-zinc-500 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
