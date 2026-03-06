"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props { secret: string }

// ── ERD data ────────────────────────────────────────────────────────────────

interface ErdField { name: string; type: string; pk?: boolean; fk?: string; nullable?: boolean }
interface ErdTable { id: string; label: string; desc: string; x: number; y: number; fields: ErdField[] }
interface ErdLink { from: string; to: string; label?: string }

const TABLES: ErdTable[] = [
  {
    id: "brand", label: "brand", desc: "Produttori", x: 40, y: 260,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "nome", type: "text" },
      { name: "url", type: "text", nullable: true },
      { name: "logo", type: "text", nullable: true },
      { name: "attivo", type: "bool" },
    ],
  },
  {
    id: "filament_type", label: "filament_type", desc: "Tipi (PLA, PETG...)", x: 40, y: 60,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "nome", type: "text" },
      { name: "difficolta_stampa", type: "int", nullable: true },
      { name: "temp_stampa_min/max", type: "int", nullable: true },
      { name: "flessibile", type: "bool" },
      { name: "igroscopico", type: "bool" },
    ],
  },
  {
    id: "filament_variant", label: "filament_variant", desc: "Varianti (Matte, CF...)", x: 320, y: 60,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "id_type", type: "int", fk: "filament_type" },
      { name: "nome", type: "text" },
      { name: "temp_stampa_min/max", type: "int", nullable: true },
    ],
  },
  {
    id: "filament", label: "filament", desc: "Prodotti specifici", x: 600, y: 160,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "id_variant", type: "int", fk: "filament_variant" },
      { name: "id_brand", type: "int", fk: "brand" },
      { name: "colore", type: "text", nullable: true },
      { name: "colore_hex", type: "varchar", nullable: true },
      { name: "peso_g", type: "int" },
      { name: "diametro_mm", type: "numeric" },
      { name: "sku", type: "text", nullable: true },
    ],
  },
  {
    id: "tag", label: "tag", desc: "Caratteristiche speciali", x: 1000, y: 60,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "nome", type: "text" },
      { name: "colore", type: "varchar", nullable: true },
    ],
  },
  {
    id: "filament_tag", label: "filament_tag", desc: "Filamento ↔ Tag", x: 840, y: 160,
    fields: [
      { name: "id_filament", type: "int", fk: "filament", pk: true },
      { name: "id_tag", type: "int", fk: "tag", pk: true },
    ],
  },
  {
    id: "shop", label: "shop", desc: "Negozi online", x: 600, y: 420,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "nome", type: "text" },
      { name: "url", type: "text", nullable: true },
      { name: "paese", type: "char(2)", nullable: true },
      { name: "tipo", type: "text", nullable: true },
    ],
  },
  {
    id: "filament_shop", label: "filament_shop", desc: "Link acquisto", x: 320, y: 420,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "id_filament", type: "int", fk: "filament" },
      { name: "id_shop", type: "int", fk: "shop" },
      { name: "link", type: "text" },
      { name: "affiliazione", type: "bool" },
      { name: "attivo", type: "bool" },
    ],
  },
  {
    id: "price_history", label: "price_history", desc: "Storico prezzi", x: 40, y: 420,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "id_filament_shop", type: "int", fk: "filament_shop" },
      { name: "prezzo", type: "numeric" },
      { name: "prezzo_scontato", type: "numeric", nullable: true },
      { name: "disponibile", type: "bool", nullable: true },
      { name: "rilevato_at", type: "timestamp" },
    ],
  },
  {
    id: "printer_profile", label: "printer_profile", desc: "Stampanti", x: 600, y: 600,
    fields: [
      { name: "id", type: "serial", pk: true },
      { name: "nome", type: "text" },
      { name: "brand", type: "text", nullable: true },
    ],
  },
  {
    id: "filament_variant_printer", label: "filament_variant_printer", desc: "Variante ↔ Stampante", x: 320, y: 600,
    fields: [
      { name: "id_variant", type: "int", fk: "filament_variant", pk: true },
      { name: "id_printer", type: "int", fk: "printer_profile", pk: true },
      { name: "note", type: "text", nullable: true },
    ],
  },
];

const LINKS: ErdLink[] = [
  { from: "filament_variant", to: "filament_type", label: "id_type" },
  { from: "filament", to: "filament_variant", label: "id_variant" },
  { from: "filament", to: "brand", label: "id_brand" },
  { from: "filament_tag", to: "filament", label: "id_filament" },
  { from: "filament_tag", to: "tag", label: "id_tag" },
  { from: "filament_shop", to: "filament", label: "id_filament" },
  { from: "filament_shop", to: "shop", label: "id_shop" },
  { from: "price_history", to: "filament_shop", label: "id_filament_shop" },
  { from: "filament_variant_printer", to: "filament_variant", label: "id_variant" },
  { from: "filament_variant_printer", to: "printer_profile", label: "id_printer" },
];

const TABLE_W = 200;
const ROW_H = 22;
const HEADER_H = 48;

function tableHeight(t: ErdTable) { return HEADER_H + t.fields.length * ROW_H + 10; }
function tableCenterX(t: ErdTable) { return t.x + TABLE_W / 2; }
function tableCenterY(t: ErdTable) { return t.y + tableHeight(t) / 2; }

function getEdgePoint(t: ErdTable, tx: number, ty: number): [number, number] {
  const cx = tableCenterX(t);
  const cy = tableCenterY(t);
  const h = tableHeight(t);
  const dx = tx - cx;
  const dy = ty - cy;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const hw = TABLE_W / 2;
  const hh = h / 2;
  if (absDx === 0 && absDy === 0) return [cx, cy];
  if (absDx / hw > absDy / hh) {
    const s = dx > 0 ? 1 : -1;
    return [cx + s * hw, cy + dy * (hw / absDx)];
  } else {
    const s = dy > 0 ? 1 : -1;
    return [cx + dx * (hh / absDy), cy + s * hh];
  }
}

function ErdSvg({ counts }: { counts: Record<string, number> | null }) {
  const tableMap = Object.fromEntries(TABLES.map(t => [t.id, t]));

  const SVG_W = 1280;
  const SVG_H = 800;

  return (
    <>
      {/* Connessioni */}
      {LINKS.map((l, i) => {
        const from = tableMap[l.from];
        const to = tableMap[l.to];
        if (!from || !to) return null;
        const [x1, y1] = getEdgePoint(from, tableCenterX(to), tableCenterY(to));
        const [x2, y2] = getEdgePoint(to, x1, y1);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3f3f46" strokeWidth={1.5} markerEnd="url(#arrow)" />
            {l.label && (
              <text x={mx} y={my - 4} fill="#71717a" fontSize={9} textAnchor="middle" className="pointer-events-none select-none">
                {l.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Tabelle */}
      {TABLES.map(t => {
        const h = tableHeight(t);
        const count = counts?.[t.id];
        return (
          <g key={t.id} transform={`translate(${t.x},${t.y})`}>
            {/* Ombra */}
            <rect x={3} y={3} width={TABLE_W} height={h} rx={8} fill="black" opacity={0.3} />
            {/* Body */}
            <rect width={TABLE_W} height={h} rx={8} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
            {/* Header */}
            <rect width={TABLE_W} height={HEADER_H} rx={8} fill="#27272a" />
            <rect y={HEADER_H - 8} width={TABLE_W} height={8} fill="#27272a" />
            {/* Nome tabella */}
            <text x={10} y={20} fill="#34d399" fontSize={11} fontWeight="bold" fontFamily="monospace" className="select-none">
              {t.label}
            </text>
            {/* Desc */}
            <text x={10} y={36} fill="#71717a" fontSize={9} className="select-none">{t.desc}</text>
            {/* Count badge */}
            {count !== undefined && (
              <text x={TABLE_W - 8} y={20} fill="#52525b" fontSize={9} textAnchor="end" className="select-none">
                {count.toLocaleString("it-IT")} righe
              </text>
            )}
            {/* Divider */}
            <line x1={0} y1={HEADER_H} x2={TABLE_W} y2={HEADER_H} stroke="#3f3f46" strokeWidth={1} />
            {/* Campi */}
            {t.fields.map((field, fi) => {
              const fy = HEADER_H + fi * ROW_H + ROW_H / 2 + 4;
              return (
                <g key={field.name}>
                  {field.pk && (
                    <text x={9} y={fy} fill="#fbbf24" fontSize={8} className="select-none">🔑</text>
                  )}
                  {field.fk && !field.pk && (
                    <text x={9} y={fy} fill="#60a5fa" fontSize={8} className="select-none">→</text>
                  )}
                  <text x={20} y={fy} fill={field.nullable ? "#52525b" : "#d4d4d8"} fontSize={9} fontFamily="monospace" className="select-none">
                    {field.name}
                  </text>
                  <text x={TABLE_W - 8} y={fy} fill="#3f3f46" fontSize={9} textAnchor="end" fontFamily="monospace" className="select-none">
                    {field.type}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Views overlay */}
      <g opacity={0.5}>
        <rect x={SVG_W - 220} y={10} width={210} height={130} rx={8} fill="#1e1b4b" stroke="#4338ca" strokeWidth={1} strokeDasharray="4 2" />
        <text x={SVG_W - 215} y={28} fill="#818cf8" fontSize={10} fontWeight="bold" className="select-none">VIEWS</text>
        {[
          "v_filament_props",
          "v_price_latest",
          "v_filament_full",
          "v_price_history_full",
        ].map((v, i) => (
          <text key={v} x={SVG_W - 215} y={46 + i * 18} fill="#6366f1" fontSize={9} fontFamily="monospace" className="select-none">{v}</text>
        ))}
      </g>
    </>
  );
}

const DB_TABLES: { key: string; label: string; desc: string }[] = [
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

export default function DatabaseTab({ secret }: Props) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  // Pan & zoom
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch(`/api/admin/db-status?secret=${secret}`)
      .then(r => r.json())
      .then(d => { setCounts(d.counts); setLoading(false); });
  }, [secret]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2.5, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onMouseUp = () => { dragging.current = false; };

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Struttura Database</h2>
      <p className="text-xs text-zinc-500 mb-5">Schema ER interattivo. Scorri per zoomare, trascina per spostarti.</p>

      {/* ERD interattivo */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Schema ER</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-bold transition-colors flex items-center justify-center">+</button>
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}
              className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-bold transition-colors flex items-center justify-center">−</button>
            <button onClick={() => { setZoom(0.85); setPan({ x: 0, y: 0 }); }}
              className="px-2 h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-xs transition-colors">Reset</button>
            <span className="text-xs text-zinc-600">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
        <div
          className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ height: 480 }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            onWheel={onWheel}
            style={{ display: "block" }}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#52525b" />
              </marker>
              {/* Griglia puntini di sfondo */}
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#27272a" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <ErdSvg counts={counts} />
            </g>
          </svg>
        </div>
        {/* Legenda */}
        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-600">
          <span className="flex items-center gap-1"><span className="text-amber-400">🔑</span> Primary key</span>
          <span className="flex items-center gap-1"><span className="text-blue-400 font-mono text-sm">→</span> Foreign key</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-zinc-600"></span> Relazione</span>
          <span className="flex items-center gap-1 ml-auto text-zinc-700">Campo in grigio = nullable</span>
        </div>
      </div>

      {/* Statistiche tabelle */}
      <div>
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Record per tabella
          {!loading && <span className="text-zinc-700 font-normal ml-2">({total.toLocaleString("it-IT")} totali)</span>}
        </h3>
        {loading ? (
          <p className="text-zinc-500 text-sm">Caricamento...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DB_TABLES.map(({ key, label, desc }) => {
              const count = counts?.[key] ?? 0;
              const maxCount = Math.max(...Object.values(counts ?? {}), 1);
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <code className="text-xs text-emerald-400 font-mono">{label}</code>
                    <span className="text-base font-bold text-zinc-100">{count.toLocaleString("it-IT")}</span>
                  </div>
                  <p className="text-xs text-zinc-600 mb-2">{desc}</p>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Views */}
      <div className="mt-8">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Views SQL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { nome: "v_filament_props", desc: "Proprietà tecniche effettive con ereditarietà COALESCE(variante, tipo)" },
            { nome: "v_price_latest", desc: "Ultimo prezzo per ogni link attivo + prezzo_finale e €/kg calcolati con LATERAL" },
            { nome: "v_filament_full", desc: "Vista catalogo completa: filamento + brand + tipo/variante + miglior prezzo" },
            { nome: "v_price_history_full", desc: "Storico completo con contesto (brand, tipo, shop) per i grafici prezzi" },
          ].map(v => (
            <div key={v.nome} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <code className="text-sm text-indigo-400 font-mono">{v.nome}</code>
              <p className="text-xs text-zinc-500 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
