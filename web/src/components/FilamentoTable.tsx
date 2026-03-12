"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import ConfróntoButton from "./ConfróntoButton";

interface Props {
  filamenti: FilamentoRow[];
}

const TYPE_BADGE: Record<string, string> = {
  "PLA":     "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40",
  "PLA-CF":  "bg-teal-950/80 text-teal-300 border border-teal-700/40",
  "PETG":    "bg-blue-950/80 text-blue-400 border border-blue-800/40",
  "PETG-CF": "bg-blue-950/80 text-blue-300 border border-blue-700/40",
  "ABS":     "bg-orange-950/80 text-orange-400 border border-orange-800/40",
  "ASA":     "bg-amber-950/80 text-amber-400 border border-amber-800/40",
  "TPU":     "bg-purple-950/80 text-purple-400 border border-purple-800/40",
  "NYLON":   "bg-cyan-950/80 text-cyan-400 border border-cyan-800/40",
  "PA-CF":   "bg-cyan-950/80 text-cyan-300 border border-cyan-700/40",
  "PC":      "bg-red-950/80 text-red-400 border border-red-800/40",
  "HIPS":    "bg-zinc-800/80 text-zinc-300 border border-zinc-700/40",
  "PVA":     "bg-pink-950/80 text-pink-400 border border-pink-800/40",
};

const DIFF_COLOR = ["", "text-emerald-500", "text-emerald-400", "text-amber-400", "text-orange-400", "text-red-400"];
const DIFF_LABEL = ["", "●", "●", "●", "●", "●"];

const col = createColumnHelper<FilamentoRow>();
const PAGE_SIZE = 25;

export default function FilamentoTable({ filamenti }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "prezzo_per_kg_min", desc: false },
  ]);
  const [pageIndex, setPageIndex] = useState(0);

  const columns = useMemo(
    () => [
      // ── Filamento ──────────────────────────────────────────────
      col.accessor((f) => `${f.brand} ${f.tipo} ${f.variante} ${f.colore ?? ""}`, {
        id: "filamento",
        header: "Filamento",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row: { original: f } }) => {
          const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g, f.is_refill);
          return (
            <Link href={`/filamento/${slug}`} className="flex items-center gap-3 group/cell min-w-0">
              {/* Thumbnail */}
              <div className="shrink-0">
                {f.link_immagine ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.link_immagine} alt="" className="w-9 h-9 object-contain rounded bg-zinc-800 p-0.5" loading="lazy" />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full border-2 border-zinc-700 flex items-center justify-center"
                    style={{ backgroundColor: f.colore_hex ?? "#3f3f46" }}
                  >
                    <div className="w-3 h-3 rounded-full bg-zinc-900/70" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className={`text-xs font-mono px-1.5 py-0 rounded-full leading-5 ${TYPE_BADGE[f.tipo] ?? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/40"}`}>
                    {f.tipo}
                  </span>
                  {f.is_refill && (
                    <span className="text-xs bg-amber-900/60 text-amber-300 border border-amber-700/40 px-1.5 py-0 rounded-full leading-5">
                      Refill
                    </span>
                  )}
                </div>
                <p className="text-zinc-100 font-medium text-sm leading-tight group-hover/cell:text-emerald-400 transition-colors truncate">
                  {f.brand} <span className="text-zinc-400 font-normal">{f.variante}</span>
                </p>
                {f.colore && (
                  <p className="flex items-center gap-1 mt-0.5">
                    {f.colore_hex && (
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-600 shrink-0" style={{ backgroundColor: f.colore_hex }} />
                    )}
                    <span className="text-zinc-500 text-xs truncate">{f.colore}</span>
                  </p>
                )}
              </div>
            </Link>
          );
        },
      }),

      // ── Peso ───────────────────────────────────────────────────
      col.accessor("peso_g", {
        header: "Peso",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-zinc-400 whitespace-nowrap text-xs">{getValue()}g</span>
        ),
      }),

      // ── Prezzo min ─────────────────────────────────────────────
      col.accessor("prezzo_min", {
        header: "Prezzo",
        enableSorting: true,
        sortUndefined: 1,
        sortingFn: (a, b, colId) => {
          const pa = a.getValue<number | null>(colId) != null ? Number(a.getValue(colId)) : Infinity;
          const pb = b.getValue<number | null>(colId) != null ? Number(b.getValue(colId)) : Infinity;
          return pa - pb;
        },
        cell: ({ row: { original: f } }) => {
          const v = f.prezzo_min;
          const available = Number(f.num_shop) > 0;
          return (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${available ? "bg-emerald-500" : "bg-zinc-700"}`} title={available ? "Disponibile" : "Non disponibile"} />
              {v != null
                ? <span className="text-zinc-100 font-semibold whitespace-nowrap">€ {Number(v).toFixed(2)}</span>
                : <span className="text-zinc-600 text-xs">N/D</span>}
            </div>
          );
        },
      }),

      // ── €/kg ───────────────────────────────────────────────────
      col.accessor("prezzo_per_kg_min", {
        header: "€/kg",
        enableSorting: true,
        sortUndefined: 1,
        sortingFn: (a, b, colId) => {
          const pa = a.getValue<number | null>(colId) != null ? Number(a.getValue(colId)) : Infinity;
          const pb = b.getValue<number | null>(colId) != null ? Number(b.getValue(colId)) : Infinity;
          return pa - pb;
        },
        cell: ({ getValue }) => {
          const v = getValue();
          return v != null
            ? <span className="text-emerald-400 font-bold whitespace-nowrap">€ {Number(v).toFixed(2)}</span>
            : <span className="text-zinc-700">—</span>;
        },
      }),

      // ── Shop + difficoltà ──────────────────────────────────────
      col.accessor("num_shop", {
        header: "Shop",
        enableSorting: true,
        sortingFn: (a, b) => Number(a.original.num_shop) - Number(b.original.num_shop),
        cell: ({ row: { original: f } }) => {
          const n = Number(f.num_shop);
          const diff = f.difficolta_stampa;
          return (
            <div className="flex items-center gap-2">
              <span className={`text-xs ${n > 0 ? "text-zinc-400" : "text-zinc-700"}`}>
                {n > 0 ? `${n} shop` : "—"}
              </span>
              {diff ? (
                <span className={`text-xs ${DIFF_COLOR[diff]}`} title={["", "Molto facile", "Facile", "Medio", "Difficile", "Molto difficile"][diff]}>
                  {DIFF_LABEL[diff].repeat(diff)}
                </span>
              ) : null}
            </div>
          );
        },
      }),

      // ── Azioni ─────────────────────────────────────────────────
      col.display({
        id: "azioni",
        header: "",
        cell: ({ row: { original: f } }) => {
          const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g, f.is_refill);
          return (
            <div className="flex items-center gap-2 justify-end">
              <div className="relative w-7 h-7">
                <ConfróntoButton id={f.id} />
              </div>
              <Link
                href={`/filamento/${slug}`}
                className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors whitespace-nowrap px-2 py-1 rounded hover:bg-zinc-800"
              >
                Dettaglio →
              </Link>
            </div>
          );
        },
      }),
    ],
    []
  );

  // Quando si ordina per prezzo, escludi filamenti senza prezzo
  const PRICE_COLS = new Set(["prezzo_min", "prezzo_per_kg_min"]);
  const sortingByPrice = sorting.some((s) => PRICE_COLS.has(s.id));
  const data = sortingByPrice
    ? filamenti.filter((f) => f.prezzo_min != null)
    : filamenti;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize: PAGE_SIZE } },
    onSortingChange: (updater) => { setSorting(updater); setPageIndex(0); },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize: PAGE_SIZE });
        setPageIndex(next.pageIndex);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;
  const rows = table.getRowModel().rows;

  function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
    if (!sorted) return <span className="text-zinc-700 ml-1">↕</span>;
    return <span className="text-emerald-400 ml-1">{sorted === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="sm:hidden space-y-2">
        {rows.map(({ original: f }) => {
          const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g, f.is_refill);
          const available = Number(f.num_shop) > 0;
          return (
            <div key={f.id} className="relative">
              <Link
                href={`/filamento/${slug}`}
                className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/40 transition-colors"
              >
                {f.link_immagine ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.link_immagine} alt="" className="w-10 h-10 object-contain rounded bg-zinc-800 p-0.5 shrink-0" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-zinc-700 shrink-0 flex items-center justify-center" style={{ backgroundColor: f.colore_hex ?? "#3f3f46" }}>
                    <div className="w-3 h-3 rounded-full bg-zinc-900/70" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className={`text-xs font-mono px-1.5 py-0 rounded-full leading-5 ${TYPE_BADGE[f.tipo] ?? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/40"}`}>{f.tipo}</span>
                    {f.is_refill && <span className="text-xs bg-amber-900/60 text-amber-300 border border-amber-700/40 px-1.5 py-0 rounded-full leading-5">Refill</span>}
                    <span className="text-zinc-500 text-xs">{f.brand} {f.variante}</span>
                  </p>
                  <p className="text-sm text-zinc-100 truncate">{f.colore ?? "—"}</p>
                  <p className="text-xs text-zinc-600">{f.peso_g}g · ⌀{f.diametro_mm}mm</p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <div className="flex items-center justify-end gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-zinc-700"}`} />
                    {f.prezzo_min != null && <p className="text-sm font-bold text-zinc-100">€ {Number(f.prezzo_min).toFixed(2)}</p>}
                  </div>
                  {f.prezzo_per_kg_min != null && <p className="text-xs text-emerald-400">€ {Number(f.prezzo_per_kg_min).toFixed(2)}/kg</p>}
                  {!f.prezzo_min && <p className="text-xs text-zinc-600">N/D</p>}
                </div>
              </Link>
              <ConfróntoButton id={f.id} />
            </div>
          );
        })}
      </div>

      {/* Desktop: tabella */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/80 text-left border-b border-zinc-800">
                {table.getFlatHeaders().map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted  = header.column.getIsSorted();
                  const isEkg   = header.column.id === "prezzo_per_kg_min";
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-4 py-3 text-xs font-medium uppercase tracking-wider select-none whitespace-nowrap ${canSort ? "cursor-pointer hover:text-zinc-300 transition-colors" : ""} ${sorted ? "text-emerald-400" : "text-zinc-500"} ${isEkg && !sorted ? "text-emerald-400/60" : ""}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && <SortIcon sorted={sorted} />}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    Nessun filamento trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-zinc-600">
            {pageIndex * PAGE_SIZE + 1}–{Math.min((pageIndex + 1) * PAGE_SIZE, data.length)} di {data.length}{sortingByPrice && data.length < filamenti.length ? ` (${filamenti.length - data.length} senza prezzo esclusi)` : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prec
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - currentPage) <= 2)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`sep-${i}`} className="text-zinc-600 px-1">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => table.setPageIndex(p as number)}
                      className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                        currentPage === p ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {(p as number) + 1}
                    </button>
                  )
                )}
            </div>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Succ →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
