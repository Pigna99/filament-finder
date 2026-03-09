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

  return (
    <>
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
