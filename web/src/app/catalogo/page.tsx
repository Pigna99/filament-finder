import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoFilters from "@/components/FilamentoFilters";
import { getCatalogo, getColoriFamiglie } from "@/lib/filamenti";

export const revalidate = 900;

const _BASE = process.env.SITE_URL ?? "https://filamenti.offerteai.it";

export const metadata: Metadata = {
  title: "Catalogo filamenti 3D — Confronto prezzi PLA, PETG, TPU e altri",
  description: "Tutti i filamenti per stampa 3D con confronto prezzi tra i principali shop italiani. Filtra per tipo (PLA, PETG, TPU, ABS), brand, colore, diametro e prezzo.",
  alternates: { canonical: `${_BASE}/catalogo` },
  openGraph: { url: `${_BASE}/catalogo` },
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; brand?: string }>;
}) {
  const sp = await searchParams;

  const [filamenti, famiglie] = await Promise.all([
    getCatalogo({ tipo: sp.tipo, brand: sp.brand }).catch(() => []),
    getColoriFamiglie().catch(() => []),
  ]);

  const tipi = [...new Set(filamenti.map((f) => f.tipo))].sort();
  const brands = [...new Set(filamenti.map((f) => f.brand))].sort();

  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        { "@type": "ListItem", position: 2, name: "Catalogo", item: `${base}/catalogo` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Catalogo filamenti 3D",
      description: `${filamenti.length} filamenti da stampa 3D con confronto prezzi tra i principali shop italiani.`,
      url: `${base}/catalogo`,
      publisher: { "@type": "Organization", name: "Filament Finder", url: base },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Catalogo filamenti 3D
          </h1>
          <p className="text-zinc-400">
            {filamenti.length} filamenti nel database. Usa i filtri per trovare quello che cerchi.
          </p>
        </div>

        {filamenti.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-2">Nessun filamento nel database</p>
            <p className="text-sm">
              Aggiungi i primi filamenti dall&apos;
              <a href="/admin" className="text-emerald-400 hover:underline">admin console</a>.
            </p>
          </div>
        ) : (
          <Suspense>
            <FilamentoFilters
              filamenti={filamenti}
              tipi={tipi}
              brands={brands}
              famiglie={famiglie}
            />
          </Suspense>
        )}
      </main>
      <Footer />
    </>
  );
}
