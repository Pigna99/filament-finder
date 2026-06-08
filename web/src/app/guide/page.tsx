import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import { GUIDE } from "@/lib/guide";

const _GUIDE_BASE = process.env.SITE_URL ?? "https://filamenti.offerteai.it";

export const metadata: Metadata = {
  title: "Guide alla Stampa 3D — Filament Finder",
  description:
    "Guide complete sui filamenti FDM: PLA, PETG, ABS, TPU, Nylon e consigli per scegliere e conservare i materiali.",
  alternates: { canonical: `${_GUIDE_BASE}/guide` },
  openGraph: { url: `${_GUIDE_BASE}/guide` },
};

export default function GuidePage() {
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        { "@type": "ListItem", position: 2, name: "Guide", item: `${base}/guide` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Guide alla Stampa 3D",
      description: "Guide complete sui filamenti FDM: PLA, PETG, ABS, TPU, Nylon e consigli per scegliere e conservare i materiali.",
      url: `${base}/guide`,
      publisher: { "@type": "Organization", name: "Filament Finder", url: base },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-[length:var(--step-3)] font-bold mb-3">Guide alla stampa 3D</h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "var(--ink-3)" }}>
            Tutto quello che devi sapere sui filamenti FDM: caratteristiche, parametri di stampa,
            consigli d&apos;acquisto e come conservarli al meglio.
          </p>
        </div>

        {/* Grid guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDE.map((g) => (
            <Link
              key={g.slug}
              href={`/guide/${g.slug}`}
              className="group flex flex-col rounded-2xl p-5 border transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
            >
              <div className="text-3xl mb-3">{g.icona}</div>
              <h2 className="text-base font-semibold mb-1 transition-colors group-hover:[color:var(--accent)]">
                {g.titolo}
              </h2>
              <p className="text-sm leading-snug mb-4" style={{ color: "var(--ink-3)" }}>{g.sottotitolo}</p>
              <div className="mt-auto flex items-center justify-between">
                {g.tipo ? (
                  <span className="inline-block text-xs font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}>
                    {g.tipo}
                  </span>
                ) : <span />}
                <span className="inline-flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent)" }}>
                  Leggi
                  <Icon name="arrow-right" size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA catalogo */}
        <div className="mt-16 rounded-2xl p-8 text-center border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
          <h2 className="text-xl font-bold mb-2">Confronta i prezzi</h2>
          <p className="mb-6 text-sm" style={{ color: "var(--ink-3)" }}>
            Dopo aver scelto il materiale giusto, confronta i prezzi di oltre 1500 filamenti da più negozi.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            Vai al catalogo
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
