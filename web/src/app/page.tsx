import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilamentoCard from "@/components/FilamentoCard";
import { getTopFilamenti } from "@/lib/filamenti";

export const revalidate = 900;

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
              { tipo: "PLA",    desc: "Facile da stampare, biodegradabile" },
              { tipo: "PETG",   desc: "Resistente e flessibile" },
              { tipo: "TPU",    desc: "Flessibile, elastico" },
              { tipo: "ABS",    desc: "Alta resistenza termica" },
              { tipo: "ASA",    desc: "Resistente ai raggi UV" },
              { tipo: "NYLON",  desc: "Massima resistenza meccanica" },
              { tipo: "PC",     desc: "Policarbonato, uso tecnico" },
              { tipo: "PLA-CF", desc: "Con fibra di carbonio" },
            ].map(({ tipo, desc }) => (
              <Link
                key={tipo}
                href={`/catalogo?tipo=${tipo}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className={`inline-flex items-center text-sm font-mono font-bold px-2.5 py-1 rounded-full mb-3 ${TYPE_BADGE[tipo] ?? "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                  {tipo}
                </div>
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
