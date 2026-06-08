import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFilamentiByIds, getPrezziShop, getStoricoPrezziMulti, type FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import { tipoBadgeStyle } from "@/lib/tipo-style";
import PriceChart from "@/components/PriceChart";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ ids?: string }> }): Promise<Metadata> {
  const { ids: rawIds } = await searchParams;
  const ids = (rawIds ?? "").split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0).slice(0, 4);
  if (ids.length < 2) return { title: "Confronto filamenti" };
  const filamenti = await getFilamentiByIds(ids).catch(() => []);
  if (filamenti.length < 2) return { title: "Confronto filamenti" };
  const names = filamenti.map(f => `${f.brand} ${f.variante}`).join(" vs ");
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const canonical = `${base}/confronta?ids=${ids.join(",")}`;
  return {
    title: `${names} — Confronto Filament Finder`,
    description: `Confronto prezzi e caratteristiche: ${names}. Scopri quale filamento offre il miglior rapporto qualità/prezzo.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

const DIFFICOLTA_LABEL = ["", "Molto facile", "Facile", "Medio", "Difficile", "Molto difficile"];

function Val({ v }: { v: React.ReactNode }) {
  return <span style={{ color: "var(--ink-1)" }}>{v ?? <span style={{ color: "var(--ink-4)" }}>—</span>}</span>;
}

function BoolVal({ v }: { v: boolean | null | undefined }) {
  if (v == null) return <span style={{ color: "var(--ink-4)" }}>—</span>;
  return <span style={{ color: v ? "var(--good)" : "var(--ink-3)" }}>{v ? "Sì" : "No"}</span>;
}

export default async function ConfrontaPage({ searchParams }: Props) {
  const { ids: rawIds } = await searchParams;
  const ids = (rawIds ?? "")
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n) && n > 0)
    .slice(0, 4);

  if (ids.length < 2) notFound();

  const filamenti = await getFilamentiByIds(ids);
  if (filamenti.length < 2) notFound();

  const [prezziPerFilamento, storicoMap] = await Promise.all([
    Promise.all(filamenti.map((f) => getPrezziShop(f.id).catch(() => []))),
    getStoricoPrezziMulti(ids).catch(() => ({} as Record<number, import("@/lib/filamenti").PuntoStorico[]>)),
  ]);

  const col = `w-1/${filamenti.length === 2 ? "2" : filamenti.length === 3 ? "3" : "4"}`;

  const Row = ({ label, render }: { label: string; render: (f: FilamentoRow, i: number) => React.ReactNode }) => (
    <tr className="border-b" style={{ borderColor: "var(--line)" }}>
      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap w-36" style={{ color: "var(--ink-4)" }}>{label}</td>
      {filamenti.map((f, i) => (
        <td key={f.id} className={`px-4 py-3 text-sm ${col}`}>{render(f, i)}</td>
      ))}
    </tr>
  );

  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogo", item: `${base}/catalogo` },
      { "@type": "ListItem", position: 3, name: "Confronto filamenti", item: `${base}/confronta` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-xs mb-6" style={{ color: "var(--ink-4)" }} aria-label="breadcrumb">
          <Link href="/" className="transition-colors hover:[color:var(--ink-2)]">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/catalogo" className="transition-colors hover:[color:var(--ink-2)]">Catalogo</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--ink-2)" }}>Confronto</span>
        </nav>

        <h1 className="text-[length:var(--step-2)] font-bold mb-8">Confronto filamenti</h1>

        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--line)" }}>
          <table className="w-full border-collapse">
            {/* Intestazioni filamenti */}
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
                <th className="px-4 py-3 w-36" />
                {filamenti.map((f) => {
                  const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g, f.is_refill);
                  return (
                    <th key={f.id} className={`px-4 py-4 text-left ${col}`}>
                      <Link href={`/filamento/${slug}`} className="group block">
                        {f.link_immagine ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.link_immagine} alt="" className="w-20 h-20 object-contain mb-3 mx-auto" />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-full mb-3 mx-auto"
                            style={{ backgroundColor: f.colore_hex ?? "var(--surface-3)", boxShadow: "inset 0 0 0 3px var(--surface-2), 0 0 0 1.5px var(--line-strong)" }}
                          />
                        )}
                        <p className="text-xs" style={{ color: "var(--ink-4)" }}>{f.brand}</p>
                        <p className="text-sm font-semibold transition-colors group-hover:[color:var(--accent)] leading-snug" style={{ color: "var(--ink-1)" }}>
                          {f.tipo} {f.variante} {f.colore ?? ""}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--ink-4)" }}>{f.peso_g}g · ⌀{f.diametro_mm}mm</p>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* Prezzi */}
              <tr className="border-b" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--ink-3)" }} colSpan={filamenti.length + 1}>
                  Prezzi migliori
                </td>
              </tr>
              <Row label="Prezzo min" render={(_, i) => {
                const best = prezziPerFilamento[i].find(p => p.disponibile);
                return best ? <span className="font-bold" style={{ color: "var(--good)" }}>€ {Number(best.prezzo_finale).toFixed(2)}</span> : <span style={{ color: "var(--ink-4)" }}>N/D</span>;
              }} />
              <Row label="€/kg" render={(_, i) => {
                const best = prezziPerFilamento[i].find(p => p.disponibile && p.prezzo_per_kg);
                return best?.prezzo_per_kg ? <Val v={`€ ${Number(best.prezzo_per_kg).toFixed(2)}`} /> : <span className="text-zinc-600">—</span>;
              }} />
              <Row label="Shop disp." render={(_, i) => {
                const n = prezziPerFilamento[i].filter(p => p.disponibile).length;
                return <Val v={`${n} shop`} />;
              }} />

              {/* Specifiche */}
              <tr className="border-b" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--ink-3)" }} colSpan={filamenti.length + 1}>
                  Specifiche
                </td>
              </tr>
              <Row label="Tipo" render={(f) => <span className="font-mono text-xs px-2 py-0.5 rounded-full border" style={tipoBadgeStyle(f.tipo)}>{f.tipo}</span>} />
              <Row label="Variante" render={(f) => <Val v={f.variante} />} />
              <Row label="Peso" render={(f) => <Val v={`${f.peso_g} g`} />} />
              <Row label="Diametro" render={(f) => <Val v={`${f.diametro_mm} mm`} />} />
              <Row label="Refill" render={(f) => <BoolVal v={f.is_refill} />} />
              <Row label="Densità" render={(f) => <Val v={f.densita_g_cm3 ? `${f.densita_g_cm3} g/cm³` : null} />} />
              {filamenti.some(f => f.rating_medio) && (
                <Row label="Rating" render={(f) => <Val v={f.rating_medio ? `${f.rating_medio}/5 (${f.num_recensioni})` : null} />} />
              )}

              {/* Proprietà tecniche */}
              <tr className="border-b" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--ink-3)" }} colSpan={filamenti.length + 1}>
                  Proprietà tecniche
                </td>
              </tr>
              <Row label="Temp. stampa" render={(f) =>
                f.temp_stampa_min && f.temp_stampa_max
                  ? <Val v={`${f.temp_stampa_min}–${f.temp_stampa_max} °C`} />
                  : <span className="text-zinc-600">—</span>
              } />
              <Row label="Temp. piatto" render={(f) =>
                f.temp_piatto_min != null
                  ? <Val v={`${f.temp_piatto_min}–${f.temp_piatto_max} °C`} />
                  : <span className="text-zinc-600">—</span>
              } />
              <Row label="Difficoltà" render={(f) =>
                <Val v={f.difficolta_stampa ? DIFFICOLTA_LABEL[f.difficolta_stampa] : null} />
              } />
              <Row label="Flessibile"   render={(f) => <BoolVal v={f.flessibile} />} />
              <Row label="Igroscopico"  render={(f) => <BoolVal v={f.igroscopico} />} />
              <Row label="Enclosure"    render={(f) => <BoolVal v={f.richiede_enclosure} />} />
              <Row label="Food safe"    render={(f) => <BoolVal v={f.food_safe} />} />

              {/* Storico prezzi */}
              <tr className="border-b" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--ink-3)" }} colSpan={filamenti.length + 1}>
                  Storico prezzi
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 text-sm font-medium whitespace-nowrap w-36">Andamento</td>
                {filamenti.map((f) => {
                  const storico = (storicoMap[f.id] ?? []).map((p) => ({
                    ...p,
                    rilevato_at: p.rilevato_at instanceof Date ? p.rilevato_at.toISOString() : String(p.rilevato_at),
                  }));
                  return (
                    <td key={f.id} className={`px-4 py-3 ${col}`}>
                      {storico.length > 0 ? (
                        <PriceChart data={storico} height={120} />
                      ) : (
                        <span className="text-xs" style={{ color: "var(--ink-4)" }}>Nessun dato</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Link shop */}
              <tr className="border-b" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--ink-3)" }} colSpan={filamenti.length + 1}>
                  Acquista
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3" />
                {filamenti.map((f, i) => {
                  const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g, f.is_refill);
                  const available = prezziPerFilamento[i].filter(p => p.disponibile);
                  return (
                    <td key={f.id} className={`px-4 py-3 text-sm ${col}`}>
                      <div className="space-y-1.5">
                        {available.slice(0, 3).map(p => (
                          <a
                            key={p.id_filament_shop}
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors border"
                            style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--line)" }}
                          >
                            <span className="text-xs truncate mr-2" style={{ color: "var(--ink-2)" }}>{p.shop}</span>
                            <span className="font-semibold text-xs shrink-0" style={{ color: "var(--good)" }}>€ {Number(p.prezzo_finale).toFixed(2)}</span>
                          </a>
                        ))}
                        {available.length === 0 && (
                          <span className="text-xs" style={{ color: "var(--ink-4)" }}>Non disponibile</span>
                        )}
                        <Link
                          href={`/filamento/${slug}`}
                          className="block text-xs transition-colors mt-1"
                          style={{ color: "var(--ink-4)" }}
                        >
                          Tutti i prezzi →
                        </Link>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
