import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoCard from "@/components/FilamentoCard";
import { getCatalogo, getAllBrands, getBrandStats } from "@/lib/filamenti";

export const revalidate = 900;

interface Props {
  params: Promise<{ brand: string }>;
}

// Risolve lo slug brand → nome brand reale
async function resolveBrand(slug: string): Promise<string | null> {
  const brands = await getAllBrands().catch(() => []);
  const found = brands.find(b => b.slug === slug);
  return found?.nome ?? null;
}

export async function generateStaticParams() {
  const brands = await getAllBrands().catch(() => []);
  return brands.map(b => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: slug } = await params;
  const brandNome = await resolveBrand(slug);
  if (!brandNome) return { title: "Brand non trovato" };
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const canonical = `${base}/brand/${slug}`;
  return {
    title: `Filamenti ${brandNome} — Prezzi e confronto`,
    description: `Confronta tutti i filamenti ${brandNome}: PLA, PETG, TPU e altri. Trova il miglior prezzo tra i principali shop italiani.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand: slug } = await params;
  const brandNome = await resolveBrand(slug);
  if (!brandNome) notFound();

  const [filamenti, stats] = await Promise.all([
    getCatalogo({ brand: brandNome }).catch(() => []),
    getBrandStats(brandNome).catch(() => null),
  ]);

  if (filamenti.length === 0) notFound();

  const tipi = [...new Set(filamenti.map(f => f.tipo))].sort();
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogo", item: `${base}/catalogo` },
      { "@type": "ListItem", position: 3, name: brandNome, item: `${base}/brand/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-300">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/catalogo" className="hover:text-zinc-300">Catalogo</Link>
          <span className="mx-2">›</span>
          <span className="text-zinc-300">{brandNome}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Filamenti {brandNome}
          </h1>
          <p className="text-zinc-400 mb-4">
            {filamenti.length} varianti disponibili
            {stats?.prezzo_min ? ` · da €${Number(stats.prezzo_min).toFixed(2)}` : ""}
          </p>
          {/* Tipi badge */}
          <div className="flex flex-wrap gap-2">
            {tipi.map(t => (
              <Link
                key={t}
                href={`/catalogo?brand=${encodeURIComponent(brandNome)}&tipo=${t}`}
                className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-mono px-3 py-1 rounded-full transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
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
