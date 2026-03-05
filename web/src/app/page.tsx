import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoCard from "@/components/FilamentoCard";
import { getTopFilamenti } from "@/lib/filamenti";

export const revalidate = 900;

export default async function HomePage() {
  const top = await getTopFilamenti(6).catch(() => []);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-4">
            Trova il filamento{" "}
            <span className="text-emerald-400">giusto</span>
            <br />al prezzo{" "}
            <span className="text-emerald-400">migliore</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Confronta PLA, PETG, TPU e molto altro tra i principali shop online.
            Storico prezzi, filtri avanzati e compatibilità stampanti.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/catalogo"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Sfoglia il catalogo →
            </Link>
            <Link
              href="/catalogo?tipo=PLA"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Migliori PLA
            </Link>
          </div>
        </section>

        {/* Top filamenti per €/kg */}
        {top.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-100">
                Miglior rapporto qualità/prezzo
              </h2>
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

        {/* Categorie rapide */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-zinc-100 mb-6">Esplora per tipo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { tipo: "PLA",   emoji: "🟢", desc: "Facile da stampare, biodegradabile" },
              { tipo: "PETG",  emoji: "🔵", desc: "Resistente e flessibile" },
              { tipo: "TPU",   emoji: "🟡", desc: "Flessibile, elastico" },
              { tipo: "ABS",   emoji: "🔴", desc: "Alta resistenza termica" },
              { tipo: "ASA",   emoji: "🟠", desc: "Resistente ai raggi UV" },
              { tipo: "NYLON", emoji: "⚪", desc: "Massima resistenza meccanica" },
              { tipo: "PC",    emoji: "🔷", desc: "Policarbonato, uso tecnico" },
              { tipo: "PLA-CF",emoji: "⬛", desc: "Con fibra di carbonio" },
            ].map(({ tipo, emoji, desc }) => (
              <Link
                key={tipo}
                href={`/catalogo?tipo=${tipo}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="text-2xl mb-2">{emoji}</div>
                <div className="font-mono font-bold text-emerald-400 text-sm">{tipo}</div>
                <div className="text-xs text-zinc-500 mt-1">{desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
