"use client";

import type { ElegooPromo } from "@/lib/filamenti";
import CopyCodeButton from "@/components/CopyCodeButton";
import SectionHeader from "@/components/SectionHeader";

interface Props {
  deals: ElegooPromo[];
  banners: ElegooPromo[];
}

function DealCard({ deal }: { deal: ElegooPromo }) {
  const hasCode = !!deal.codice;
  const hasPct  = deal.sconto_tipo === "PERCENT" && deal.sconto_valore;
  const hasAmt  = deal.sconto_tipo === "FIXED" && deal.sconto_valore;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2 border"
      style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
    >
      {/* Badge sconto */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug flex-1" style={{ color: "var(--ink-1)" }}>{deal.nome}</p>
        {(hasPct || hasAmt) && (
          <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--good-quiet)", color: "var(--good)" }}>
            -{deal.sconto_valore}{hasPct ? "%" : ` ${deal.sconto_valuta}`}
          </span>
        )}
      </div>

      {deal.descrizione && deal.descrizione !== deal.nome && (
        <p className="text-xs leading-snug" style={{ color: "var(--ink-3)" }}>{deal.descrizione}</p>
      )}

      {/* Codice promo */}
      {hasCode && <CopyCodeButton code={deal.codice!} />}

      {/* Link + scadenza */}
      <div className="flex items-center gap-2 flex-wrap mt-auto">
        {deal.data_fine && (
          <p className="text-xs" style={{ color: "var(--ink-4)" }}>
            Scade: {new Date(deal.data_fine).toLocaleDateString("it-IT")}
          </p>
        )}
        {deal.tracking_link && (
          <a
            href={deal.tracking_link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="ml-auto text-xs hover:underline font-medium"
            style={{ color: "var(--accent)" }}
          >
            Vai all&apos;offerta →
          </a>
        )}
      </div>
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
      <SectionHeader icon="tag" title="Offerte & coupon Elegoo" href="/offerte" linkLabel="Vedi tutti i banner" />

      {/* Banner hero */}
      {heroBanner?.tracking_link && (
        <a
          href={heroBanner.tracking_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block mb-6 rounded-xl overflow-hidden border transition-colors hover:[border-color:var(--line-strong)]"
          style={{ borderColor: "var(--line)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/banner/${heroBanner.id}`}
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
