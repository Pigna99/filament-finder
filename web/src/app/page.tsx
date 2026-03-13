import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoCard from "@/components/FilamentoCard";
import { getTopFilamenti, getFilamentiScontati, getSiteStats, getElegooPromos } from "@/lib/filamenti";
import ElegooPromos from "@/components/ElegooPromos";
import { slugifyFilamento } from "@/lib/slugify";
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

const TYPE_BADGE: Record<string, string> = {
  "PLA":     "bg-emerald-950/90 text-emerald-400 border border-emerald-800/50",
  "PLA-CF":  "bg-teal-950/90 text-teal-300 border border-teal-700/50",
  "PETG":    "bg-blue-950/90 text-blue-400 border border-blue-800/50",
  "PETG-CF": "bg-blue-950/90 text-blue-300 border border-blue-700/50",
  "ABS":     "bg-orange-950/90 text-orange-400 border border-orange-800/50",
  "ASA":     "bg-amber-950/90 text-amber-400 border border-amber-800/50",
  "TPU":     "bg-purple-950/90 text-purple-400 border border-purple-800/50",
  "NYLON":   "bg-cyan-950/90 text-cyan-400 border border-cyan-800/50",
  "PC":      "bg-red-950/90 text-red-400 border border-red-800/50",
};

const TYPE_INFO: { tipo: string; desc: string; emoji: string }[] = [
  { tipo: "PLA",    desc: "Facile da stampare, biodegradabile",    emoji: "🟢" },
  { tipo: "PETG",   desc: "Resistente, impermeabile, versatile",   emoji: "🔵" },
  { tipo: "TPU",    desc: "Flessibile ed elastico",                emoji: "🟣" },
  { tipo: "ABS",    desc: "Alta resistenza termica",               emoji: "🟠" },
  { tipo: "ASA",    desc: "Resistente ai raggi UV, outdoor",       emoji: "🟡" },
  { tipo: "NYLON",  desc: "Massima resistenza meccanica",          emoji: "🔵" },
  { tipo: "PC",     desc: "Policarbonato, uso tecnico",            emoji: "🔴" },
  { tipo: "PLA-CF", desc: "Con fibra di carbonio, rigidissimo",    emoji: "⚫" },
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
        <section className="relative overflow-hidden bg-zinc-950 border-b border-zinc-800/60">
          {/* Sfondo decorativo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)," +
                "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.04) 0%, transparent 50%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px)," +
                "linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Prezzi aggiornati ogni giorno
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 mb-5 leading-tight">
              Confronta i prezzi{" "}
              <br className="hidden sm:block" />
              dei{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #34d399, #059669)" }}
              >
                filamenti 3D
              </span>
            </h1>

            <p className="text-zinc-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
              PLA, PETG, TPU, Nylon e molto altro — storico prezzi, filtri avanzati
              e confronto tra i principali shop italiani.
            </p>

            <div className="flex gap-3 justify-center flex-wrap mb-10">
              <Link
                href="/catalogo"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-emerald-900/40"
              >
                Sfoglia il catalogo →
              </Link>
              <Link
                href="/guide"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-zinc-700"
              >
                Guide materiali
              </Link>
            </div>

            {/* Stats bar */}
            {(stats.num_filamenti > 0 || stats.num_shop > 0) && (
              <div className="inline-flex items-center gap-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-3 text-sm flex-wrap justify-center">
                {stats.num_filamenti > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-base">{stats.num_filamenti}+</span>
                    <span className="text-zinc-500">filamenti</span>
                  </div>
                )}
                <div className="w-px h-4 bg-zinc-700" />
                {stats.num_brand > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-base">{stats.num_brand}</span>
                    <span className="text-zinc-500">marche</span>
                  </div>
                )}
                <div className="w-px h-4 bg-zinc-700" />
                {stats.num_shop > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-base">{stats.num_shop}</span>
                    <span className="text-zinc-500">shop confrontati</span>
                  </div>
                )}
                <div className="w-px h-4 bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-base">100%</span>
                  <span className="text-zinc-500">gratuito</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">

          {/* ── Sconti attivi ───────────────────────────────────────── */}
          {scontati.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔥</span>
                  <h2 className="text-xl font-bold text-zinc-100">Sconti attivi ora</h2>
                  <span className="text-xs bg-red-900/60 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full font-medium">
                    {scontati.length} offerte
                  </span>
                </div>
                <Link href="/catalogo" className="text-sm text-emerald-400 hover:underline">
                  Vedi tutti →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {scontati.map((f) => {
                  const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g, f.is_refill);
                  const sconto = Math.round(f.sconto_percentuale);
                  return (
                    <Link
                      key={f.id}
                      href={`/filamento/${slug}`}
                      className="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-900/20 relative"
                    >
                      {/* Immagine / swatch */}
                      <div className="h-32 bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                        {f.link_immagine ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.link_immagine}
                            alt={`${f.brand} ${f.tipo} ${f.variante} ${f.colore ?? ""}`}
                            className="w-full h-full object-contain p-3"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-full border-4 border-zinc-900 shadow-lg"
                            style={{ backgroundColor: f.colore_hex ?? "#3f3f46" }}
                          >
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full bg-zinc-900/80" />
                            </div>
                          </div>
                        )}
                        {/* Badge sconto prominente */}
                        <span className="absolute top-2 right-2 text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full shadow">
                          -{sconto}%
                        </span>
                        <span className={`absolute top-2 left-2 text-xs font-mono px-2 py-0.5 rounded-full ${TYPE_BADGE[f.tipo] ?? "bg-zinc-950/80 text-zinc-400 border border-zinc-700/50"}`}>
                          {f.tipo}
                        </span>
                      </div>

                      <div className="p-3">
                        <p className="text-xs text-zinc-500 mb-0.5">{f.brand}</p>
                        <h3 className="text-xs font-semibold text-zinc-100 leading-snug group-hover:text-red-400 transition-colors">
                          {f.variante} {f.colore ?? ""}
                        </h3>
                        <p className="text-xs text-zinc-600 mb-2">{f.peso_g}g</p>
                        <div className="flex items-end gap-1.5 flex-wrap">
                          {f.prezzo_min && (
                            <span className="text-sm font-bold text-zinc-100">
                              da €{Number(f.prezzo_min).toFixed(2)}
                            </span>
                          )}
                          <span className="text-xs text-zinc-600 line-through">
                            €{Number(f.prezzo_originale_sconto).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{f.shop_sconto}</p>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💰</span>
                  <h2 className="text-xl font-bold text-zinc-100">Miglior rapporto qualità/prezzo</h2>
                </div>
                <Link href="/catalogo" className="text-sm text-emerald-400 hover:underline">
                  Vedi tutti →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {top.map((f) => (
                  <FilamentoCard key={f.id} f={f} />
                ))}
              </div>
            </section>
          )}

          {/* ── Guide ──────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xl">📖</span>
                <h2 className="text-xl font-bold text-zinc-100">Guide ai materiali</h2>
              </div>
              <Link href="/guide" className="text-sm text-emerald-400 hover:underline">
                Tutte le guide →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {guideInEvidence.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guide/${g.slug}`}
                  className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="text-2xl mb-3">{g.icona}</div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors mb-1">
                    {g.titolo}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {g.sottotitolo}
                  </p>
                  <p className="text-xs text-emerald-500 mt-3 group-hover:underline">Leggi la guida →</p>
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
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">🧵</span>
              <h2 className="text-xl font-bold text-zinc-100">Esplora per materiale</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {TYPE_INFO.map(({ tipo, desc, emoji }) => (
                <Link
                  key={tipo}
                  href={`/catalogo?tipo=${tipo}`}
                  className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5 text-center"
                >
                  <div className="text-xl mb-2">{emoji}</div>
                  <div className={`inline-flex items-center justify-center text-xs font-mono font-bold px-2.5 py-1 rounded-full mb-2 ${TYPE_BADGE[tipo] ?? "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                    {tipo}
                  </div>
                  <p className="text-xs text-zinc-600 leading-snug mt-1">{desc}</p>
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
