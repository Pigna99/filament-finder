import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoFilters from "@/components/FilamentoFilters";
import { getCatalogo, getColoriFamiglie } from "@/lib/filamenti";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Catalogo filamenti 3D",
  description: "Tutti i filamenti per stampa 3D con confronto prezzi, filtri per tipo, brand, colore e diametro.",
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

  return (
    <>
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
          <FilamentoFilters
            filamenti={filamenti}
            tipi={tipi}
            brands={brands}
            famiglie={famiglie}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
