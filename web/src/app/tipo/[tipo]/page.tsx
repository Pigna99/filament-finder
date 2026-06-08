import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoCard from "@/components/FilamentoCard";
import Icon from "@/components/Icon";
import { tipoBadgeStyle } from "@/lib/tipo-style";
import { getCatalogo, getAllTipi } from "@/lib/filamenti";

export const revalidate = 900;

interface Props {
  params: Promise<{ tipo: string }>;
}

export async function generateStaticParams() {
  const tipi = await getAllTipi().catch(() => []);
  return tipi.map(t => ({ tipo: t.toLowerCase() }));
}

async function resolveTipo(slug: string): Promise<string | null> {
  const tipi = await getAllTipi().catch(() => []);
  return tipi.find(t => t.toLowerCase() === slug.toLowerCase()) ?? null;
}

const TIPO_DESC: Record<string, string> = {
  "PLA":     "Facile da stampare, biodegradabile, ideale per principianti e prototipi.",
  "PETG":    "Resistente, impermeabile e versatile. Ottimo equilibrio tra facilità e prestazioni.",
  "ABS":     "Alta resistenza termica, adatto per parti funzionali. Richiede enclosure.",
  "ASA":     "Come l'ABS ma resistente ai raggi UV. Perfetto per uso outdoor.",
  "TPU":     "Flessibile ed elastico. Ideale per guaine, custodie e parti ammortizzanti.",
  "NYLON":   "Massima resistenza meccanica e flessibilità. Igroscopico, richiede essiccatura.",
  "PC":      "Policarbonato, durezza estrema e resistenza al calore. Uso tecnico avanzato.",
  "PLA-CF":  "PLA rinforzato con fibra di carbonio: leggero, rigidissimo e dall'aspetto premium.",
  "PETG-CF": "PETG con fibra di carbonio: resistenza chimica + rigidità elevata.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo: slug } = await params;
  const tipo = await resolveTipo(slug);
  if (!tipo) return { title: "Tipo non trovato" };
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const canonical = `${base}/tipo/${slug}`;
  const desc = TIPO_DESC[tipo] ?? "";
  return {
    title: `Filamenti ${tipo} — Prezzi e confronto shop italiani`,
    description: `${desc} Confronta i prezzi dei filamenti ${tipo} tra i principali shop italiani su Filament Finder.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function TipoPage({ params }: Props) {
  const { tipo: slug } = await params;
  const tipo = await resolveTipo(slug);
  if (!tipo) notFound();

  const filamenti = await getCatalogo({ tipo }).catch(() => []);
  if (filamenti.length === 0) notFound();

  const brands = [...new Set(filamenti.map(f => f.brand))].sort();
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogo", item: `${base}/catalogo` },
      { "@type": "ListItem", position: 3, name: `Filamenti ${tipo}`, item: `${base}/tipo/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs mb-6" style={{ color: "var(--ink-4)" }} aria-label="breadcrumb">
          <Link href="/" className="transition-colors hover:[color:var(--ink-2)]">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/catalogo" className="transition-colors hover:[color:var(--ink-2)]">Catalogo</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--ink-2)" }}>Filamenti {tipo}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono font-bold px-3 py-1 rounded-full border" style={tipoBadgeStyle(tipo)}>{tipo}</span>
            <h1 className="text-[length:var(--step-3)] font-bold">Filamenti {tipo}</h1>
          </div>
          {TIPO_DESC[tipo] && (
            <p className="mb-4 max-w-2xl" style={{ color: "var(--ink-3)" }}>{TIPO_DESC[tipo]}</p>
          )}
          <p className="text-sm mb-4" style={{ color: "var(--ink-4)" }}>{filamenti.length} varianti disponibili</p>
          {/* Brand badge */}
          <div className="flex flex-wrap gap-2">
            {brands.map(b => (
              <Link
                key={b}
                href={`/catalogo?tipo=${tipo}&brand=${encodeURIComponent(b)}`}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--ink-2)" }}
              >
                {b}
              </Link>
            ))}
          </div>
        </div>

        {/* Link guida se esiste */}
        <div className="mb-6">
          <Link
            href={`/guide/${tipo.toLowerCase().replace("-cf", "")}`}
            className="inline-flex items-center gap-2 text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
            <Icon name="book" size={15} /> Leggi la guida al {tipo} →
          </Link>
        </div>

        {/* Grid filamenti */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filamenti.map(f => (
            <FilamentoCard key={f.id} f={f} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
