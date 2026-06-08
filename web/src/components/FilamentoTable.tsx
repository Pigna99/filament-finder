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
import { tipoBadgeStyle, difficoltaColor, DIFFICOLTA_LABEL } from "@/lib/tipo-style";
import ConfróntoButton from "./ConfróntoButton";

interface Props {
  filamenti: FilamentoRow[];
}

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
                  <img src={f.link_immagine} alt="" className="w-9 h-9 object-contain rounded p-0.5" style={{ backgroundColor: "var(--surface-2)" }} loading="lazy" />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full grid place-items-center"
                    style={{ backgroundColor: f.colore_hex ?? "var(--surface-3)", boxShadow: "inset 0 0 0 2px var(--surface-1)" }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--surface-1)" }} />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="text-xs font-mono px-1.5 py-0 rounded-full leading-5 border" style={tipoBadgeStyle(f.tipo)}>
                    {f.tipo}
                  </span>
                  {f.is_refill && (
                    <span className="text-xs px-1.5 py-0 rounded-full leading-5 border" style={{ color: "oklch(0.85 0.1 75)", backgroundColor: "oklch(0.3 0.05 75 / 0.6)", borderColor: "oklch(0.45 0.08 75 / 0.4)" }}>
                      Refill
                    </span>
                  )}
                </div>
                <p className="font-medium text-sm leading-tight transition-colors group-hover/cell:[color:var(--accent)] truncate" style={{ color: "var(--ink-1)" }}>
                  {f.brand} <span className="font-normal" style={{ color: "var(--ink-3)" }}>{f.variante}</span>
                </p>
                {f.colore && (
                  <p className="flex items-center gap-1 mt-0.5">
                    {f.colore_hex && (
                      <span className="w-2.5 h-2.5 rounded-full border shrink-0" style={{ backgroundColor: f.colore_hex, borderColor: "var(--line-strong)" }} />
                    )}
                    <span className="text-xs truncate" style={{ color: "var(--ink-4)" }}>{f.colore}</span>
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
          <span className="whitespace-nowrap text-xs" style={{ color: "var(--ink-3)" }}>{getValue()}g</span>
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
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: available ? "var(--good)" : "var(--line-strong)" }} title={available ? "Disponibile" : "Non disponibile"} />
              {v != null
                ? <span className="font-semibold whitespace-nowrap" style={{ color: "var(--ink-1)" }}>€ {Number(v).toFixed(2)}</span>
                : <span className="text-xs" style={{ color: "var(--ink-4)" }}>N/D</span>}
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
            ? <span className="font-bold whitespace-nowrap" style={{ color: "var(--good)" }}>€ {Number(v).toFixed(2)}</span>
            : <span style={{ color: "var(--ink-4)" }}>—</span>;
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
              <span className="text-xs" style={{ color: n > 0 ? "var(--ink-3)" : "var(--ink-4)" }}>
                {n > 0 ? `${n} shop` : "—"}
              </span>
              {diff ? (
                <span className="text-xs tracking-tight" style={{ color: difficoltaColor(diff) }} title={DIFFICOLTA_LABEL[diff]}>
                  {"●".repeat(diff)}
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
                className="text-xs transition-colors whitespace-nowrap px-2 py-1 rounded hover:[color:var(--accent)] hover:[background-color:var(--surface-2)]"
                style={{ color: "var(--ink-4)" }}
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
    if (!sorted) return <span className="ml-1" style={{ color: "var(--ink-4)" }}>↕</span>;
    return <span className="ml-1" style={{ color: "var(--accent)" }}>{sorted === "asc" ? "↑" : "↓"}</span>;
  }

  const pageBtn = "px-3 py-1.5 rounded-lg text-sm border disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

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
                className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
              >
                {f.link_immagine ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.link_immagine} alt="" className="w-10 h-10 object-contain rounded p-0.5 shrink-0" style={{ backgroundColor: "var(--surface-2)" }} loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-full shrink-0 grid place-items-center" style={{ backgroundColor: f.colore_hex ?? "var(--surface-3)", boxShadow: "inset 0 0 0 2px var(--surface-1)" }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--surface-1)" }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-xs font-mono px-1.5 py-0 rounded-full leading-5 border" style={tipoBadgeStyle(f.tipo)}>{f.tipo}</span>
                    {f.is_refill && <span className="text-xs px-1.5 py-0 rounded-full leading-5 border" style={{ color: "oklch(0.85 0.1 75)", backgroundColor: "oklch(0.3 0.05 75 / 0.6)", borderColor: "oklch(0.45 0.08 75 / 0.4)" }}>Refill</span>}
                    <span className="text-xs" style={{ color: "var(--ink-4)" }}>{f.brand} {f.variante}</span>
                  </p>
                  <p className="text-sm truncate" style={{ color: "var(--ink-1)" }}>{f.colore ?? "—"}</p>
                  <p className="text-xs" style={{ color: "var(--ink-4)" }}>{f.peso_g}g · ⌀{f.diametro_mm}mm</p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <div className="flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: available ? "var(--good)" : "var(--line-strong)" }} />
                    {f.prezzo_min != null && <p className="text-sm font-bold" style={{ color: "var(--ink-1)" }}>€ {Number(f.prezzo_min).toFixed(2)}</p>}
                  </div>
                  {f.prezzo_per_kg_min != null && <p className="text-xs" style={{ color: "var(--good)" }}>€ {Number(f.prezzo_per_kg_min).toFixed(2)}/kg</p>}
                  {!f.prezzo_min && <p className="text-xs" style={{ color: "var(--ink-4)" }}>N/D</p>}
                </div>
              </Link>
              <ConfróntoButton id={f.id} />
            </div>
          );
        })}
      </div>

      {/* Desktop: tabella */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--line)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                {table.getFlatHeaders().map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted  = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-4 py-3 text-xs font-semibold select-none whitespace-nowrap ${canSort ? "cursor-pointer transition-colors" : ""}`}
                      style={{ color: sorted ? "var(--accent)" : "var(--ink-3)" }}
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
                <tr key={row.id} className="border-t transition-colors group hover:[background-color:color-mix(in_oklab,var(--surface-2)_40%,transparent)]" style={{ borderColor: "var(--line)" }}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm" style={{ color: "var(--ink-4)" }}>
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
          <p className="text-xs" style={{ color: "var(--ink-4)" }}>
            {pageIndex * PAGE_SIZE + 1}–{Math.min((pageIndex + 1) * PAGE_SIZE, data.length)} di {data.length}{sortingByPrice && data.length < filamenti.length ? ` (${filamenti.length - data.length} senza prezzo esclusi)` : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={pageBtn}
              style={{ backgroundColor: "var(--surface-2)", color: "var(--ink-2)", borderColor: "var(--line)" }}
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
                    <span key={`sep-${i}`} className="px-1" style={{ color: "var(--ink-4)" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => table.setPageIndex(p as number)}
                      aria-current={currentPage === p ? "page" : undefined}
                      className="w-8 h-8 rounded-lg text-sm transition-colors border"
                      style={currentPage === p
                        ? { backgroundColor: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" }
                        : { backgroundColor: "var(--surface-2)", color: "var(--ink-3)", borderColor: "var(--line)" }}
                    >
                      {(p as number) + 1}
                    </button>
                  )
                )}
            </div>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={pageBtn}
              style={{ backgroundColor: "var(--surface-2)", color: "var(--ink-2)", borderColor: "var(--line)" }}
            >
              Succ →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
