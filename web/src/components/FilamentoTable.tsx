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

const col = createColumnHelper<FilamentoRow>();

const PAGE_SIZE = 25;

export default function FilamentoTable({ filamenti }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "prezzo_per_kg_min", desc: false },
  ]);
  const [pageIndex, setPageIndex] = useState(0);

  const columns = useMemo(
    () => [
      col.accessor((f) => `${f.brand} ${f.tipo} ${f.variante}`, {
        id: "filamento",
        header: "Filamento",
        enableSorting: true,
        sortingFn: "alphanumeric",
        cell: ({ row: { original: f } }) => {
          const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
          return (
            <div className="flex items-center gap-2">
              {f.link_immagine && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.link_immagine} alt="" className="w-8 h-8 object-contain rounded bg-zinc-800 p-0.5 shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${TYPE_BADGE[f.tipo] ?? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/40"}`}>
                    {f.tipo}
                  </span>
                </div>
                <span className="text-zinc-100 font-medium">{f.brand}</span>
                <span className="text-zinc-500"> {f.variante}</span>
              </div>
            </div>
          );
        },
      }),
      col.accessor("colore", {
        header: "Colore",
        enableSorting: true,
        sortUndefined: 1,
        cell: ({ row: { original: f } }) => (
          <div className="flex items-center gap-1.5">
            {f.colore_hex && (
              <span
                className="w-3 h-3 rounded-full border border-zinc-700 shrink-0"
                style={{ backgroundColor: f.colore_hex }}
              />
            )}
            <span className="text-zinc-400 text-xs">{f.colore ?? <span className="text-zinc-600">—</span>}</span>
          </div>
        ),
      }),
      col.accessor("peso_g", {
        header: "Peso",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-zinc-400 whitespace-nowrap">{getValue()}g</span>
        ),
      }),
      col.accessor("diametro_mm", {
        header: "⌀ mm",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-zinc-500 text-xs whitespace-nowrap">{getValue()} mm</span>
        ),
      }),
      col.accessor("prezzo_min", {
        header: "Prezzo",
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
            ? <span className="text-zinc-100 whitespace-nowrap">€ {Number(v).toFixed(2)}</span>
            : <span className="text-zinc-600">—</span>;
        },
      }),
      col.accessor("prezzo_per_kg_min", {
        header: "€ / kg",
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
            ? <span className="text-emerald-400 font-bold whitespace-nowrap">€ {Number(v).toFixed(2)}/kg</span>
            : <span className="text-zinc-600">—</span>;
        },
      }),
      col.display({
        id: "link",
        header: "",
        cell: ({ row: { original: f } }) => {
          const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
          return (
            <Link
              href={`/filamento/${slug}`}
              className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              Dettaglio →
            </Link>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filamenti,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize: PAGE_SIZE } },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPageIndex(0);
    },
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
          const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
          const prezzoMin = f.prezzo_min ? `€ ${Number(f.prezzo_min).toFixed(2)}` : null;
          const prezzoKg = f.prezzo_per_kg_min ? `€ ${Number(f.prezzo_per_kg_min).toFixed(2)}/kg` : null;
          return (
            <Link
              key={slug}
              href={`/filamento/${slug}`}
              className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/40 transition-colors"
            >
              {f.link_immagine ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.link_immagine} alt="" className="w-10 h-10 object-contain rounded bg-zinc-800 p-0.5 shrink-0" />
              ) : f.colore_hex ? (
                <span className="w-10 h-10 rounded-full border-2 border-zinc-700 shrink-0 flex items-center justify-center" style={{ backgroundColor: f.colore_hex }}>
                  <span className="w-3 h-3 rounded-full bg-zinc-900/80" />
                </span>
              ) : (
                <span className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">
                  <span className={`font-mono px-1.5 py-0.5 rounded-full ${TYPE_BADGE[f.tipo] ?? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/40"}`}>
                    {f.tipo}
                  </span>
                  {f.brand} {f.variante}
                </p>
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
              {table.getFlatHeaders().map((header) => {
                const canSort = header.column.getCanSort();
                const sorted  = header.column.getIsSorted();
                const isEkg   = header.column.id === "prezzo_per_kg_min";
                return (
                  <th
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    className={`pb-3 pr-4 select-none whitespace-nowrap ${canSort ? "cursor-pointer hover:text-zinc-300 transition-colors" : ""} ${sorted ? "text-emerald-400" : ""} ${isEkg && !sorted ? "text-emerald-400/60" : ""}`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {canSort && <SortIcon sorted={sorted} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 group">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2.5 pr-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
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
                      currentPage === p
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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
      )}
    </>
  );
}
