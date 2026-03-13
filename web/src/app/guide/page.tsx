import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GUIDE } from "@/lib/guide";

export const metadata: Metadata = {
  title: "Guide alla Stampa 3D — Filament Finder",
  description:
    "Guide complete sui filamenti FDM: PLA, PETG, ABS, TPU, Nylon e consigli per scegliere e conservare i materiali.",
};

const CARD_ACCENT: Record<string, string> = {
  "🟢": "border-emerald-800/50 hover:border-emerald-600/60",
  "🔵": "border-blue-800/50 hover:border-blue-600/60",
  "🟠": "border-orange-800/50 hover:border-orange-600/60",
  "🟣": "border-purple-800/50 hover:border-purple-600/60",
  "⚫": "border-zinc-700/50 hover:border-zinc-500/60",
  "🎯": "border-amber-800/50 hover:border-amber-600/60",
  "📦": "border-teal-800/50 hover:border-teal-600/60",
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
          <h1 className="text-3xl font-bold text-zinc-100 mb-3">Guide alla Stampa 3D</h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
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
              className={`group block bg-zinc-900 border rounded-xl p-5 transition-all hover:shadow-lg ${
                CARD_ACCENT[g.icona] ?? "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <div className="text-3xl mb-3">{g.icona}</div>
              <h2 className="text-base font-semibold text-zinc-100 mb-1 group-hover:text-emerald-400 transition-colors">
                {g.titolo}
              </h2>
              <p className="text-sm text-zinc-500 leading-snug mb-4">{g.sottotitolo}</p>
              {g.tipo && (
                <span className="inline-block text-xs bg-zinc-800 text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                  {g.tipo}
                </span>
              )}
              <div className="mt-3 text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Leggi la guida →
              </div>
            </Link>
          ))}
        </div>

        {/* CTA catalogo */}
        <div className="mt-14 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Confronta i prezzi</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            Dopo aver scelto il materiale giusto, confronta i prezzi di oltre 1500 filamenti da più negozi.
          </p>
          <Link
            href="/catalogo"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Vai al catalogo →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
