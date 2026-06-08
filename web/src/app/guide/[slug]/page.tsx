import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
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
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const canonical = `${base}/guide/${slug}`;
  return {
    title: `${g.titolo} — Guida Filament Finder`,
    description: g.intro.slice(0, 160),
    alternates: { canonical },
    openGraph: { url: canonical },
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
        <nav className="text-xs mb-6" style={{ color: "var(--ink-4)" }} aria-label="breadcrumb">
          <Link href="/" className="transition-colors hover:[color:var(--ink-2)]">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/guide" className="transition-colors hover:[color:var(--ink-2)]">Guide</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--ink-2)" }}>{g.titolo}</span>
        </nav>

        {/* Header guida */}
        <div className="mb-8">
          <div className="text-4xl mb-4">{g.icona}</div>
          <h1 className="text-[length:var(--step-3)] font-bold mb-2">{g.titolo}</h1>
          <p className="text-lg" style={{ color: "var(--ink-3)" }}>{g.sottotitolo}</p>
        </div>

        {/* Intro */}
        <p className="leading-relaxed mb-8 text-base" style={{ color: "var(--ink-2)" }}>{g.intro}</p>

        {/* Layout a due colonne per parametri + pros/cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          {/* Parametri tecnici */}
          {g.parametri && g.parametri.length > 0 && (
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
              <h2 className="text-sm font-semibold mb-3">Parametri di stampa</h2>
              <div className="space-y-2">
                {g.parametri.map((p) => (
                  <div key={p.label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--ink-4)" }}>{p.label}</span>
                    <span className="font-medium" style={{ color: "var(--ink-1)" }}>{p.valore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons */}
          {(g.pros.length > 0 || g.cons.length > 0) && (
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
              {g.pros.length > 0 && (
                <>
                  <h2 className="text-sm font-semibold mb-2">Vantaggi</h2>
                  <ul className="space-y-1.5 mb-4">
                    {g.pros.map((p) => (
                      <li key={p} className="text-sm flex gap-2" style={{ color: "var(--ink-2)" }}>
                        <span className="shrink-0" style={{ color: "var(--good)" }}>✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {g.cons.length > 0 && (
                <>
                  <h2 className="text-sm font-semibold mb-2">Svantaggi</h2>
                  <ul className="space-y-1.5">
                    {g.cons.map((c) => (
                      <li key={c} className="text-sm flex gap-2" style={{ color: "var(--ink-3)" }}>
                        <span className="shrink-0" style={{ color: "var(--sale)" }}>✗</span>
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
            <h2 className="text-lg font-semibold mb-2">{s.titolo}</h2>
            <p className="leading-relaxed text-sm" style={{ color: "var(--ink-3)" }}>{s.testo}</p>
          </div>
        ))}

        {/* Consigli pratici */}
        {g.consigli.length > 0 && (
          <div
            className="rounded-2xl p-5 mb-8 border"
            style={{ backgroundColor: "var(--accent-quiet)", borderColor: "var(--accent-line)" }}
          >
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--accent)" }}>Consigli pratici</h2>
            <ul className="space-y-2">
              {g.consigli.map((c) => (
                <li key={c} className="text-sm flex gap-2" style={{ color: "var(--ink-1)" }}>
                  <span className="shrink-0" style={{ color: "var(--accent)" }}>→</span>
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
              <h2 className="text-lg font-semibold">
                {g.titoloProdotti ?? "Prodotti consigliati"}
              </h2>
              <span className="text-xs rounded-full px-2.5 py-0.5 font-medium border" style={{ backgroundColor: "var(--accent-quiet)", color: "var(--accent)", borderColor: "var(--accent-line)" }}>
                Link affiliato
              </span>
            </div>
            {g.descrizioneProdotti && (
              <p className="text-sm mb-5" style={{ color: "var(--ink-3)" }}>{g.descrizioneProdotti}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {g.prodottiConsigliati.map((p) => (
                <a
                  key={p.affiliateLink}
                  href={p.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group flex flex-col rounded-2xl overflow-hidden border transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
                  style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
                >
                  {/* Immagine prodotto */}
                  <div className="relative flex items-center justify-center p-4 h-44" style={{ backgroundColor: p.imageUrl ? "var(--surface-2)" : "#fff" }}>
                    {p.badge && (
                      <span className="absolute top-3 left-3 text-xs font-semibold rounded-full px-2.5 py-0.5 z-10" style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}>
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
                      <div className="text-xs text-center px-4" style={{ color: "var(--ink-4)" }}>
                        <Icon name="external" size={40} className="mx-auto mb-2 opacity-40" />
                        {p.nomeBrevissimo}
                      </div>
                    )}
                  </div>
                  {/* Info prodotto */}
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--ink-1)" }}>
                      {p.nome}
                    </h3>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--ink-3)" }}>
                      {p.descrizione}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs" style={{ color: "var(--ink-4)" }}>Vedi prezzo aggiornato</span>
                      <span className="text-sm font-semibold transition-colors flex items-center gap-1" style={{ color: "oklch(0.82 0.13 75)" }}>
                        Amazon
                        <Icon name="external" size={14} />
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
          <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
            <div>
              <p className="font-semibold" style={{ color: "var(--ink-1)" }}>Cerchi {g.tipo} al miglior prezzo?</p>
              <p className="text-sm" style={{ color: "var(--ink-3)" }}>Confronta i prezzi da tutti i negozi su Filament Finder.</p>
            </div>
            <Link
              href={`/catalogo?tipo=${g.tipo}`}
              className="shrink-0 inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-transform hover:-translate-y-0.5 text-sm"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
            >
              Vedi tutti i {g.tipo}
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        )}

        {/* Guide correlate */}
        {correlate.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--ink-3)" }}>Guide correlate</h2>
            <div className="flex flex-wrap gap-3">
              {correlate.map((r) => r && (
                <Link
                  key={r.slug}
                  href={`/guide/${r.slug}`}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-colors"
                  style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)", color: "var(--ink-2)" }}
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
