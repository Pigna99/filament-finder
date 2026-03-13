import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getGuida, GUIDE } from "@/lib/guide";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDE.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuida(slug);
  if (!g) return { title: "Guida non trovata" };
  return {
    title: `${g.titolo} — Guida Filament Finder`,
    description: g.intro.slice(0, 160),
  };
}

export default async function GuidaPage({ params }: Props) {
  const { slug } = await params;
  const g = getGuida(slug);
  if (!g) notFound();

  const correlate = g.correlate
    ?.map((s) => GUIDE.find((x) => x.slug === s))
    .filter(Boolean) ?? [];

  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Guide", item: `${base}/guide` },
      { "@type": "ListItem", position: 3, name: g.titolo, item: `${base}/guide/${slug}` },
    ],
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.titolo,
    description: g.intro.slice(0, 160),
    url: `${base}/guide/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Filament Finder",
      url: base,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${base}/guide/${slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-300">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/guide" className="hover:text-zinc-300">Guide</Link>
          <span className="mx-2">›</span>
          <span className="text-zinc-300">{g.titolo}</span>
        </nav>

        {/* Header guida */}
        <div className="mb-8">
          <div className="text-4xl mb-4">{g.icona}</div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">{g.titolo}</h1>
          <p className="text-zinc-400 text-lg">{g.sottotitolo}</p>
        </div>

        {/* Intro */}
        <p className="text-zinc-300 leading-relaxed mb-8 text-base">{g.intro}</p>

        {/* Layout a due colonne per parametri + pros/cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          {/* Parametri tecnici */}
          {g.parametri && g.parametri.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Parametri di stampa
              </h2>
              <div className="space-y-2">
                {g.parametri.map((p) => (
                  <div key={p.label} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{p.label}</span>
                    <span className="text-zinc-200 font-medium">{p.valore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons */}
          {(g.pros.length > 0 || g.cons.length > 0) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              {g.pros.length > 0 && (
                <>
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Vantaggi</h2>
                  <ul className="space-y-1 mb-4">
                    {g.pros.map((p) => (
                      <li key={p} className="text-sm text-zinc-300 flex gap-2">
                        <span className="text-emerald-500 shrink-0">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {g.cons.length > 0 && (
                <>
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Svantaggi</h2>
                  <ul className="space-y-1">
                    {g.cons.map((c) => (
                      <li key={c} className="text-sm text-zinc-400 flex gap-2">
                        <span className="text-red-500 shrink-0">✗</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sezioni approfondite */}
        {g.sezioni.map((s) => (
          <div key={s.titolo} className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">{s.titolo}</h2>
            <p className="text-zinc-400 leading-relaxed text-sm">{s.testo}</p>
          </div>
        ))}

        {/* Consigli pratici */}
        {g.consigli.length > 0 && (
          <div className="bg-zinc-900 border border-emerald-900/40 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">
              Consigli pratici
            </h2>
            <ul className="space-y-2">
              {g.consigli.map((c) => (
                <li key={c} className="text-sm text-zinc-300 flex gap-2">
                  <span className="text-emerald-600 shrink-0">→</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prodotti consigliati */}
        {g.prodottiConsigliati && g.prodottiConsigliati.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">
                {g.titoloProdotti ?? "Prodotti consigliati"}
              </h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-0.5 font-medium">
                Link affiliato
              </span>
            </div>
            {g.descrizioneProdotti && (
              <p className="text-zinc-400 text-sm mb-5">{g.descrizioneProdotti}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {g.prodottiConsigliati.map((p) => (
                <a
                  key={p.affiliateLink}
                  href={p.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group flex flex-col bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/40"
                >
                  {/* Immagine prodotto */}
                  <div className={`relative flex items-center justify-center p-4 h-44 ${p.imageUrl ? "bg-zinc-800" : "bg-white"}`}>
                    {p.badge && (
                      <span className="absolute top-3 left-3 text-xs font-semibold bg-emerald-600 text-white rounded-full px-2.5 py-0.5 z-10">
                        {p.badge}
                      </span>
                    )}
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.nomeBrevissimo}
                        className="max-h-36 max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-zinc-600 text-xs text-center px-4">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {p.nomeBrevissimo}
                      </div>
                    )}
                  </div>
                  {/* Info prodotto */}
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    <h3 className="text-zinc-100 font-semibold text-sm leading-snug">
                      {p.nome}
                    </h3>
                    <p className="text-zinc-400 text-xs leading-relaxed flex-1">
                      {p.descrizione}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-zinc-500">Vedi prezzo aggiornato</span>
                      <span className="text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                        Amazon
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA catalogo */}
        {g.tipo && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-zinc-100 font-semibold">Cerchi {g.tipo} al miglior prezzo?</p>
              <p className="text-zinc-500 text-sm">Confronta i prezzi da tutti i negozi su Filament Finder.</p>
            </div>
            <Link
              href={`/catalogo?tipo=${g.tipo}`}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Vedi tutti i {g.tipo} →
            </Link>
          </div>
        )}

        {/* Guide correlate */}
        {correlate.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Guide correlate</h2>
            <div className="flex flex-wrap gap-3">
              {correlate.map((r) => r && (
                <Link
                  key={r.slug}
                  href={`/guide/${r.slug}`}
                  className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 transition-all"
                >
                  <span>{r.icona}</span>
                  {r.titolo}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
