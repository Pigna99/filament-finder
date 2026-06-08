import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoCard from "@/components/FilamentoCard";
import SectionHeader from "@/components/SectionHeader";
import Icon from "@/components/Icon";
import { getTopFilamenti, getFilamentiScontati, getSiteStats, getElegooPromos } from "@/lib/filamenti";
import ElegooPromos from "@/components/ElegooPromos";
import { slugifyFilamento } from "@/lib/slugify";
import { tipoBadgeStyle } from "@/lib/tipo-style";
import { GUIDE } from "@/lib/guide";

export const revalidate = 900;

const SITE_URL = process.env.SITE_URL ?? "https://filamenti.offerteai.it";

export const metadata: Metadata = {
  title: "Filament Finder — Confronta i prezzi dei filamenti 3D",
  description:
    "Trova il miglior prezzo per i filamenti da stampa 3D. Confronta PLA, PETG, TPU, ABS e molti altri tra i principali shop italiani. Storico prezzi e filtri avanzati.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Filament Finder — Confronta i prezzi dei filamenti 3D",
    description:
      "Trova il miglior prezzo per i filamenti da stampa 3D. Confronta PLA, PETG, TPU, ABS e molti altri tra i principali shop italiani.",
    type: "website",
    url: SITE_URL,
  },
};

const TYPE_INFO: { tipo: string; desc: string }[] = [
  { tipo: "PLA",    desc: "Facile, biodegradabile" },
  { tipo: "PETG",   desc: "Resistente e impermeabile" },
  { tipo: "TPU",    desc: "Flessibile ed elastico" },
  { tipo: "ABS",    desc: "Alta resistenza termica" },
  { tipo: "ASA",    desc: "Resiste ai raggi UV" },
  { tipo: "NYLON",  desc: "Massima tenuta meccanica" },
  { tipo: "PC",     desc: "Policarbonato tecnico" },
  { tipo: "PLA-CF", desc: "Con fibra di carbonio" },
];

export default async function HomePage() {
  const [top, scontati, stats, promos] = await Promise.all([
    getTopFilamenti(6).catch(() => []),
    getFilamentiScontati(6).catch(() => []),
    getSiteStats().catch(() => ({ num_filamenti: 0, num_shop: 0, num_brand: 0 })),
    getElegooPromos().catch(() => ({ deals: [], banners: [] })),
  ]);

  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Filament Finder",
      url: base,
      logo: `${base}/og-image.png`,
      description: "Confronto prezzi filamenti 3D tra i principali shop italiani.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Filament Finder",
      url: base,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${base}/catalogo?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  // Mostra 4 guide variegate: 2 materiali + 2 pratiche
  const GUIDE_HOMEPAGE = ["pla", "petg", "calibrazione", "inceppamento"];
  const guideInEvidence = GUIDE_HOMEPAGE
    .map((slug) => GUIDE.find((g) => g.slug === slug))
    .filter(Boolean) as typeof GUIDE;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--line)" }}>
          {/* Glow caldo, unico, ancorato al titolo — non un pattern decorativo a tappeto */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.78 0.16 64 / 0.10), transparent 70%)" }}
          />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
            <p
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full mb-7 border"
              style={{ color: "var(--ink-3)", borderColor: "var(--line)", backgroundColor: "var(--surface-1)" }}
            >
              <span
                className="ff-pulse w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--good)" }}
              />
              Prezzi aggiornati ogni giorno
            </p>

            <h1
              className="text-[length:var(--step-4)] sm:text-[length:var(--step-5)] font-bold leading-[1.05] mb-5"
              style={{ color: "var(--ink-1)" }}
            >
              Il filamento giusto,
              <br className="hidden sm:block" />{" "}
              <span style={{ color: "var(--accent)" }}>al prezzo migliore</span>
            </h1>

            <p className="text-lg leading-relaxed mb-9 max-w-xl mx-auto" style={{ color: "var(--ink-3)" }}>
              Confronta PLA, PETG, TPU, Nylon e molto altro tra i principali shop
              italiani. Storico prezzi, filtri avanzati e schede tecniche.
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
              >
                Sfoglia il catalogo
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm border transition-colors"
                style={{ color: "var(--ink-1)", borderColor: "var(--line-strong)", backgroundColor: "var(--surface-1)" }}
              >
                Guide materiali
              </Link>
            </div>

            {/* Stats bar */}
            {(stats.num_filamenti > 0 || stats.num_shop > 0) && (
              <dl className="mt-12 inline-flex items-center gap-6 sm:gap-8 flex-wrap justify-center text-sm">
                {[
                  stats.num_filamenti > 0 && [`${stats.num_filamenti}+`, "filamenti"],
                  stats.num_brand > 0 && [`${stats.num_brand}`, "marche"],
                  stats.num_shop > 0 && [`${stats.num_shop}`, "shop"],
                  ["100%", "gratuito"],
                ]
                  .filter(Boolean)
                  .map((entry, i) => {
                    const [value, label] = entry as [string, string];
                    return (
                      <div key={label} className="flex items-center gap-6 sm:gap-8">
                        {i > 0 && <span className="w-px h-8" style={{ backgroundColor: "var(--line)" }} />}
                        <div className="text-left">
                          <dt className="text-xs" style={{ color: "var(--ink-4)" }}>{label}</dt>
                          <dd
                            className="text-xl font-bold"
                            style={{ color: "var(--ink-1)", fontFamily: "var(--font-display)" }}
                          >
                            {value}
                          </dd>
                        </div>
                      </div>
                    );
                  })}
              </dl>
            )}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-20">

          {/* ── Sconti attivi ───────────────────────────────────────── */}
          {scontati.length > 0 && (
            <section>
              <SectionHeader
                icon="spark"
                title="Sconti attivi ora"
                badge={`${scontati.length} offerte`}
                badgeTone="sale"
                href="/catalogo"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {scontati.map((f) => {
                  const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g, f.is_refill);
                  const sconto = Math.round(f.sconto_percentuale);
                  return (
                    <Link
                      key={f.id}
                      href={`/filamento/${slug}`}
                      className="group block rounded-2xl overflow-hidden border transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
                      style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
                    >
                      <div className="h-32 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
                        {f.link_immagine ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.link_immagine}
                            alt={`${f.brand} ${f.tipo} ${f.variante} ${f.colore ?? ""}`}
                            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="w-16 h-16 rounded-full"
                            style={{
                              backgroundColor: f.colore_hex ?? "var(--surface-3)",
                              boxShadow: "inset 0 0 0 4px var(--surface-1)",
                            }}
                          />
                        )}
                        <span
                          className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--sale)", color: "oklch(0.18 0.03 22)" }}
                        >
                          -{sconto}%
                        </span>
                        <span
                          className="absolute top-2 left-2 text-xs font-mono px-2 py-0.5 rounded-full border"
                          style={tipoBadgeStyle(f.tipo)}
                        >
                          {f.tipo}
                        </span>
                      </div>

                      <div className="p-3">
                        <p className="text-xs mb-0.5" style={{ color: "var(--ink-4)" }}>{f.brand}</p>
                        <h3
                          className="text-xs font-semibold leading-snug transition-colors group-hover:[color:var(--accent)]"
                          style={{ color: "var(--ink-1)" }}
                        >
                          {f.variante} {f.colore ?? ""}
                        </h3>
                        <p className="text-xs mb-2" style={{ color: "var(--ink-4)" }}>{f.peso_g}g</p>
                        <div className="flex items-end gap-1.5 flex-wrap">
                          {f.prezzo_min && (
                            <span className="text-sm font-bold" style={{ color: "var(--ink-1)" }}>
                              da €{Number(f.prezzo_min).toFixed(2)}
                            </span>
                          )}
                          <span className="text-xs line-through" style={{ color: "var(--ink-4)" }}>
                            €{Number(f.prezzo_originale_sconto).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--ink-4)" }}>{f.shop_sconto}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Miglior €/kg ───────────────────────────────────────── */}
          {top.length > 0 && (
            <section>
              <SectionHeader
                icon="spool"
                title="Miglior rapporto qualità/prezzo"
                href="/catalogo"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {top.map((f) => (
                  <FilamentoCard key={f.id} f={f} />
                ))}
              </div>
            </section>
          )}

          {/* ── Guide ──────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon="book" title="Guide ai materiali" href="/guide" linkLabel="Tutte le guide" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {guideInEvidence.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guide/${g.slug}`}
                  className="group rounded-2xl p-5 border transition-[border-color,transform] duration-200 hover:-translate-y-0.5 flex flex-col"
                  style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
                >
                  <div className="text-2xl mb-3">{g.icona}</div>
                  <h3
                    className="font-semibold transition-colors group-hover:[color:var(--accent)] mb-1"
                    style={{ color: "var(--ink-1)" }}
                  >
                    {g.titolo}
                  </h3>
                  <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--ink-3)" }}>
                    {g.sottotitolo}
                  </p>
                  <span
                    className="mt-auto inline-flex items-center gap-1 text-sm"
                    style={{ color: "var(--accent)" }}
                  >
                    Leggi la guida
                    <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Offerte & Coupon Elegoo ────────────────────────────── */}
          {(promos.deals.length > 0 || promos.banners.length > 0) && (
            <ElegooPromos deals={promos.deals} banners={promos.banners} />
          )}

          {/* ── Esplora per tipo ───────────────────────────────────── */}
          <section>
            <SectionHeader icon="grid" title="Esplora per materiale" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TYPE_INFO.map(({ tipo, desc }) => (
                <Link
                  key={tipo}
                  href={`/catalogo?tipo=${tipo}`}
                  className="group rounded-2xl p-4 border transition-[border-color,transform] duration-200 hover:-translate-y-0.5 flex items-center gap-3"
                  style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
                >
                  <span
                    className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border shrink-0"
                    style={tipoBadgeStyle(tipo)}
                  >
                    {tipo}
                  </span>
                  <span className="text-xs leading-snug" style={{ color: "var(--ink-3)" }}>{desc}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
