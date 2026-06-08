import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getElegooPromos } from "@/lib/filamenti";
import CopyCodeButton from "@/components/CopyCodeButton";

export const revalidate = 3600;

const BASE = process.env.SITE_URL ?? "https://filamenti.offerteai.it";

export const metadata: Metadata = {
  title: "Offerte & Coupon Elegoo — Filament Finder",
  description:
    "Codici sconto e offerte attive Elegoo: risparmia su filamenti PLA, PETG, TPU e molto altro. Coupon esclusivi aggiornati.",
  alternates: { canonical: `${BASE}/offerte` },
  openGraph: { url: `${BASE}/offerte` },
};

// Classi di qualità del banner (skip logo gigante e lingue non EN)
const BANNER_SKIP = ["german", " au ", "au:"];

function isBannerOk(nome: string | null): boolean {
  if (!nome) return false;
  const n = nome.toLowerCase();
  return !BANNER_SKIP.some((kw) => n.includes(kw));
}

export default async function OffertePage() {
  const { deals, banners } = await getElegooPromos().catch(() => ({ deals: [], banners: [] }));

  // Filtra banner per lingua/area (solo EN / globali)
  const bannersFiltered = banners.filter((b) => isBannerOk(b.nome));

  // Raggruppa banner per dimensione
  const leaderboard = bannersFiltered.filter((b) => b.larghezza && b.larghezza >= 700 && b.altezza && b.altezza <= 100);
  const rettangoli  = bannersFiltered.filter((b) => b.larghezza === 300 && b.altezza === 250);
  const grandi      = bannersFiltered.filter((b) => b.larghezza && b.larghezza >= 300 && b.altezza && b.altezza >= 280 && !(b.larghezza >= 700));

  // Deals con codice promo prima
  const dealsOrdinati = [...deals].sort((a, b) => {
    if (a.codice && !b.codice) return -1;
    if (!a.codice && b.codice) return 1;
    return 0;
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Offerte Elegoo", item: `${BASE}/offerte` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs mb-6" style={{ color: "var(--ink-4)" }} aria-label="breadcrumb">
          <Link href="/" className="transition-colors hover:[color:var(--ink-2)]">Home</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--ink-2)" }}>Offerte Elegoo</span>
        </nav>

        <h1 className="text-[length:var(--step-3)] font-bold mb-2">Offerte &amp; coupon Elegoo</h1>
        <p className="text-sm mb-10" style={{ color: "var(--ink-3)" }}>
          Codici sconto e promozioni attive Elegoo. Aggiornate automaticamente ogni 6 ore da Impact.com.
        </p>

        {/* ── Sezione coupon / deals ─────────────────────────────── */}
        {dealsOrdinati.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold mb-5">Codici sconto &amp; offerte attive</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealsOrdinati.map((d) => {
                const hasPct = d.sconto_tipo === "PERCENT" && d.sconto_valore;
                const hasAmt = d.sconto_tipo === "FIXED" && d.sconto_valore;
                return (
                  <div
                    key={d.id}
                    className="rounded-2xl p-5 flex flex-col gap-3 border"
                    style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug flex-1" style={{ color: "var(--ink-1)" }}>{d.nome}</p>
                      {(hasPct || hasAmt) && (
                        <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: "var(--good-quiet)", color: "var(--good)", borderColor: "var(--good)" }}>
                          -{d.sconto_valore}{hasPct ? "%" : ` ${d.sconto_valuta}`}
                        </span>
                      )}
                    </div>

                    {d.descrizione && d.descrizione !== d.nome && (
                      <p className="text-xs leading-relaxed" style={{ color: "var(--ink-3)" }}>{d.descrizione}</p>
                    )}

                    {/* Prodotti specifici */}
                    {Array.isArray(d.prodotti) && (d.prodotti as {ProductName:string}[]).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(d.prodotti as {ProductName:string}[]).map((p, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--surface-2)", color: "var(--ink-3)" }}>
                            {p.ProductName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Codice copiabile */}
                    {d.codice && <CopyCodeButton code={d.codice} />}

                    {/* Link + scope */}
                    <div className="flex items-center gap-2 mt-auto flex-wrap">
                      <span className="text-xs" style={{ color: "var(--ink-4)" }}>
                        {d.scope === "ENTIRE_STORE" ? "Tutto il negozio" : d.scope === "PRODUCT" ? "Prodotto specifico" : ""}
                      </span>
                      {d.data_fine && (
                        <span className="text-xs" style={{ color: "var(--ink-4)" }}>
                          Scade: {new Date(d.data_fine).toLocaleDateString("it-IT")}
                        </span>
                      )}
                      {d.tracking_link && (
                        <a
                          href={d.tracking_link}
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
              })}
            </div>
          </section>
        )}

        {/* ── Banner leaderboard (728×90) ────────────────────────── */}
        {leaderboard.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold mb-5">Banner promozionali</h2>
            <div className="flex flex-col gap-4">
              {leaderboard.map((b) => (
                b.tracking_link ? (
                  <a
                    key={b.id}
                    href={b.tracking_link}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block rounded-xl overflow-hidden border transition-colors hover:[border-color:var(--line-strong)]"
                    style={{ borderColor: "var(--line)" }}
                    title={b.nome ?? "Offerta Elegoo"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/banner/${b.id}`}
                      alt={b.nome ?? "Banner Elegoo"}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </a>
                ) : null
              ))}
            </div>
          </section>
        )}

        {/* ── Rettangoli 300×250 in grid ─────────────────────────── */}
        {rettangoli.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold mb-5">Offerte in evidenza</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rettangoli.map((b) => (
                b.tracking_link ? (
                  <a
                    key={b.id}
                    href={b.tracking_link}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block rounded-xl overflow-hidden border transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:[border-color:var(--line-strong)]"
                    style={{ borderColor: "var(--line)" }}
                    title={b.nome ?? "Offerta Elegoo"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/banner/${b.id}`}
                      alt={b.nome ?? "Banner Elegoo"}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </a>
                ) : null
              ))}
            </div>
          </section>
        )}

        {/* ── Banner grandi (300×600, 336×280) ──────────────────── */}
        {grandi.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold mb-5">Altre promozioni</h2>
            <div className="flex flex-wrap gap-4">
              {grandi.map((b) => (
                b.tracking_link ? (
                  <a
                    key={b.id}
                    href={b.tracking_link}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block rounded-xl overflow-hidden border transition-colors hover:[border-color:var(--line-strong)]"
                    title={b.nome ?? "Offerta Elegoo"}
                    style={{ maxWidth: b.larghezza ? `${b.larghezza}px` : undefined, borderColor: "var(--line)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/banner/${b.id}`}
                      alt={b.nome ?? "Banner Elegoo"}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </a>
                ) : null
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {dealsOrdinati.length === 0 && bannersFiltered.length === 0 && (
          <div className="text-center py-20" style={{ color: "var(--ink-3)" }}>
            <p className="text-4xl mb-4">🎉</p>
            <p>Nessuna offerta attiva al momento. Torna presto!</p>
          </div>
        )}

        {/* CTA catalogo */}
        <div className="rounded-2xl p-8 text-center mt-6 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
          <h2 className="text-xl font-bold mb-2">Confronta i prezzi dei filamenti</h2>
          <p className="mb-6 text-sm" style={{ color: "var(--ink-3)" }}>
            Usa i coupon qui sopra e risparmia ulteriormente confrontando i prezzi tra shop.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            Vai al catalogo →
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}
