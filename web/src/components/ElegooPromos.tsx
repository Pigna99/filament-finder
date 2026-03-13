"use client";

import { useState } from "react";
import type { ElegooPromo } from "@/lib/filamenti";

interface Props {
  deals: ElegooPromo[];
  banners: ElegooPromo[];
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(code).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-2 py-0.5 rounded transition-colors"
    >
      {copied ? "Copiato!" : "Copia"}
    </button>
  );
}

function DealCard({ deal }: { deal: ElegooPromo }) {
  const hasCode = !!deal.codice;
  const hasPct  = deal.sconto_tipo === "PERCENT" && deal.sconto_valore;
  const hasAmt  = deal.sconto_tipo === "FIXED" && deal.sconto_valore;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
      {/* Badge sconto */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-zinc-200 font-medium leading-snug flex-1">{deal.nome}</p>
        {hasPct && (
          <span className="shrink-0 bg-emerald-900/60 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
            -{deal.sconto_valore}%
          </span>
        )}
        {hasAmt && (
          <span className="shrink-0 bg-emerald-900/60 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
            -{deal.sconto_valore} {deal.sconto_valuta}
          </span>
        )}
      </div>

      {deal.descrizione && deal.descrizione !== deal.nome && (
        <p className="text-xs text-zinc-500 leading-snug">{deal.descrizione}</p>
      )}

      {/* Codice promo */}
      {hasCode && (
        <div className="flex items-center mt-1">
          <span className="font-mono text-sm font-bold text-emerald-400 bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700">
            {deal.codice}
          </span>
          <CopyButton code={deal.codice!} />
        </div>
      )}

      {/* Scadenza */}
      {deal.data_fine && (
        <p className="text-xs text-zinc-600">
          Scade: {new Date(deal.data_fine).toLocaleDateString("it-IT")}
        </p>
      )}
    </div>
  );
}

export default function ElegooPromos({ deals, banners }: Props) {
  if (deals.length === 0 && banners.length === 0) return null;

  // Mostra banner più grande disponibile (larghezza massima, non resin/laser)
  const heroBanner = banners.find(b => b.larghezza && b.larghezza >= 728) ?? banners[0] ?? null;

  // Deals con codice promo prima, poi senza
  const sortedDeals = [...deals].sort((a, b) => {
    if (a.codice && !b.codice) return -1;
    if (!a.codice && b.codice) return 1;
    return 0;
  });

  return (
    <section>
      <h2 className="text-xl font-bold text-zinc-100 mb-4">
        Offerte &amp; Coupon Elegoo
      </h2>

      {/* Banner hero */}
      {heroBanner?.banner_url && heroBanner.tracking_link && (
        <a
          href={heroBanner.tracking_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block mb-6 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroBanner.banner_url}
            alt={heroBanner.nome ?? "Offerta Elegoo"}
            className="w-full object-contain"
          />
        </a>
      )}

      {/* Deals grid */}
      {sortedDeals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedDeals.map(d => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      )}
    </section>
  );
}
