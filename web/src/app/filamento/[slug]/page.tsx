import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PriceChart from "@/components/PriceChart";
import FilamentoVariantiSelector from "@/components/FilamentoVariantiSelector";
import {
  getFilamentoBySlug,
  getPrezziShop,
  getStoricoPrezzi,
  getTags,
  getVariantiModello,
  getCompatibiliPrinters,
} from "@/lib/filamenti";
import { tipoBadgeStyle } from "@/lib/tipo-style";

export const revalidate = 900;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFilamentoBySlug(slug).catch(() => null);
  if (!f) return { title: "Filamento non trovato" };
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const title = `${f.brand} ${f.tipo} ${f.variante}${f.colore ? ` ${f.colore}` : ""} ${f.peso_g}g`;
  const description = `Confronta i prezzi di ${f.brand} ${f.tipo} ${f.variante} su tutti gli shop italiani. Storico prezzi, caratteristiche tecniche e compatibilità stampanti.`;
  const canonical = `${base}/filamento/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      ...(f.link_immagine ? { images: [{ url: f.link_immagine }] } : {}),
    },
  };
}

const DIFFICOLTA_LABEL = ["", "Molto facile", "Facile", "Medio", "Difficile", "Molto difficile"];

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "< 1h fa";
  if (h < 24) return `${h}h fa`;
  const d = Math.floor(h / 24);
  return `${d}gg fa`;
}

export default async function FilamentoPage({ params }: Props) {
  const { slug } = await params;

  const f = await getFilamentoBySlug(slug).catch(() => null);
  if (!f) notFound();

  const [prezziShop, storico, tags, variantiModello, stampanti] = await Promise.all([
    getPrezziShop(f.id).catch(() => []),
    getStoricoPrezzi(f.id).catch(() => []),
    getTags(f.id).catch(() => []),
    getVariantiModello(f.id_brand, f.id_type, f.id_variant).catch(() => []),
    getCompatibiliPrinters(f.id_variant).catch(() => []),
  ]);

  const storicoSerializable = storico.map((p) => ({
    ...p,
    rilevato_at: p.rilevato_at instanceof Date ? p.rilevato_at.toISOString() : String(p.rilevato_at),
    prezzo_finale: Number(p.prezzo_finale),
    prezzo_per_kg: p.prezzo_per_kg ? Number(p.prezzo_per_kg) : null,
  }));

  const prezziShopSerializable = prezziShop.map((p) => ({
    ...p,
    rilevato_at: p.rilevato_at instanceof Date ? p.rilevato_at.toISOString() : String(p.rilevato_at),
  }));

  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Catalogo", item: `${base}/catalogo` },
      { "@type": "ListItem", position: 3, name: f.tipo, item: `${base}/catalogo?tipo=${f.tipo}` },
      { "@type": "ListItem", position: 4, name: `${f.brand} ${f.variante}${f.colore ? ` ${f.colore}` : ""}`, item: `${base}/filamento/${slug}` },
    ],
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${f.brand} ${f.tipo} ${f.variante}${f.colore ? ` ${f.colore}` : ""} ${f.peso_g}g`,
    description: `Filamento ${f.tipo} di ${f.brand}. Diametro: ${f.diametro_mm}mm.`,
    brand: { "@type": "Brand", name: f.brand },
    ...(f.link_immagine ? { image: f.link_immagine } : {}),
    url: `${base}/filamento/${slug}`,
    ...(f.rating_medio && f.num_recensioni > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(f.rating_medio).toFixed(1),
        ratingCount: f.num_recensioni,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
    ...(prezziShop.length > 0 ? {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: Number(prezziShop[0].prezzo_finale).toFixed(2),
        offerCount: prezziShop.length,
        offers: prezziShop.map((p) => ({
          "@type": "Offer",
          seller: { "@type": "Organization", name: p.shop },
          price: Number(p.prezzo_finale).toFixed(2),
          priceCurrency: "EUR",
          url: p.link,
          availability: "https://schema.org/InStock",
        })),
      },
    } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs mb-6" style={{ color: "var(--ink-4)" }} aria-label="breadcrumb">
          <a href="/" className="transition-colors hover:[color:var(--ink-2)]">Home</a>
          <span className="mx-2">›</span>
          <a href="/catalogo" className="transition-colors hover:[color:var(--ink-2)]">Catalogo</a>
          <span className="mx-2">›</span>
          <a href={`/catalogo?tipo=${f.tipo}`} className="transition-colors hover:[color:var(--ink-2)]">{f.tipo}</a>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--ink-2)" }}>{f.brand} {f.variante} {f.colore}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna sinistra: info filamento */}
          <div className="lg:col-span-1">
            {/* Immagine / swatch */}
            <div
              className="rounded-2xl p-6 flex items-center justify-center h-48 mb-4 border"
              style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
            >
              {f.link_immagine ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.link_immagine} alt={`${f.brand} ${f.variante}`} className="max-h-36 object-contain" />
              ) : (
                <div
                  className="w-24 h-24 rounded-full"
                  style={{
                    backgroundColor: f.colore_hex ?? "var(--surface-3)",
                    boxShadow: "inset 0 0 0 4px var(--surface-2), 0 0 0 1.5px var(--line-strong)",
                  }}
                />
              )}
            </div>

            {/* Badge tipo */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-mono px-3 py-1 rounded-full border" style={tipoBadgeStyle(f.tipo)}>{f.tipo}</span>
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "var(--surface-2)", color: "var(--ink-2)" }}>{f.variante}</span>
              {f.is_refill && (
                <span
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{ color: "oklch(0.85 0.1 75)", backgroundColor: "oklch(0.3 0.05 75 / 0.6)", borderColor: "oklch(0.45 0.08 75 / 0.5)" }}
                >
                  Refill — senza bobina
                </span>
              )}
              {tags.map(t => (
                <span key={t.id} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--surface-2)", color: "var(--ink-4)" }} title={t.descrizione ?? ""}>
                  {t.nome}
                </span>
              ))}
            </div>

            {/* Info base */}
            <h1 className="text-xl font-bold mb-1">
              {f.brand} {f.tipo} {f.variante}
            </h1>
            {f.colore && (
              <div className="flex items-center gap-2 mb-2">
                {f.colore_hex && <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: f.colore_hex, borderColor: "var(--line-strong)" }} />}
                <span style={{ color: "var(--ink-3)" }}>{f.colore}</span>
              </div>
            )}

            {/* Selettore varianti: colori, pesi, refill */}
            <FilamentoVariantiSelector
              varianti={variantiModello}
              currentId={f.id}
              currentColore={f.colore}
              currentPeso={f.peso_g}
              currentIsRefill={f.is_refill}
            />

            {/* Specifiche */}
            <div className="space-y-2 text-sm">
              {[
                ["Peso", `${f.peso_g} g`],
                ["Diametro", `${f.diametro_mm} mm`],
                ["SKU", f.sku],
                ["Densità", f.densita_g_cm3 ? `${f.densita_g_cm3} g/cm³` : null],
                ["Rating", f.rating_medio ? `${f.rating_medio}/5 (${f.num_recensioni} rec.)` : null],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={String(label)} className="flex justify-between py-1 border-b" style={{ borderColor: "var(--line)" }}>
                  <span style={{ color: "var(--ink-4)" }}>{label}</span>
                  <span style={{ color: "var(--ink-2)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colonna destra: prezzi e caratteristiche tecniche */}
          <div className="lg:col-span-2 space-y-6">

            {/* Caratteristiche tecniche */}
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
              <h2 className="text-base font-semibold mb-4">Caratteristiche tecniche</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["Temp. stampa", f.temp_stampa_min && f.temp_stampa_max ? `${f.temp_stampa_min}–${f.temp_stampa_max} °C` : "—"],
                  ["Temp. piatto", f.temp_piatto_min != null ? `${f.temp_piatto_min}–${f.temp_piatto_max} °C` : "—"],
                  ["Difficoltà", f.difficolta_stampa ? DIFFICOLTA_LABEL[f.difficolta_stampa] : "—"],
                  ["Flessibile", f.flessibile ? "Sì" : "No"],
                  ["Igroscopico", f.igroscopico ? "Sì — conservare ermeticamente" : "No"],
                  ["Enclosure", f.richiede_enclosure ? "Consigliata" : "Non necessaria"],
                  ["Food safe", f.food_safe ? "Sì" : "No"],
                  ["Humidity sensitive", f.humidity_sensitive ? "Sì" : "No"],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <span className="text-xs" style={{ color: "var(--ink-4)" }}>{label}</span>
                    <p style={{ color: "var(--ink-1)" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prezzi per shop */}
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
              <h2 className="text-base font-semibold mb-4">Prezzi attuali per shop</h2>
              {prezziShopSerializable.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--ink-4)" }}>Nessun prezzo disponibile.</p>
              ) : (
                <div className="space-y-3">
                  {prezziShopSerializable.map((p, i) => {
                    const disponibile = p.disponibile;
                    const isBest = disponibile && i === 0;
                    return (
                      <a
                        key={p.id_filament_shop}
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-xl transition-colors group border"
                        style={
                          !disponibile
                            ? { backgroundColor: "color-mix(in oklab, var(--surface-2) 40%, transparent)", borderColor: "var(--line)", opacity: 0.6 }
                            : isBest
                            ? { backgroundColor: "var(--good-quiet)", borderColor: "var(--good)" }
                            : { backgroundColor: "var(--surface-2)", borderColor: "transparent" }
                        }
                      >
                        {/* Colonna sinistra — cresce ma non stringe il prezzo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" style={{ color: disponibile ? "var(--ink-1)" : "var(--ink-4)" }}>{p.shop}</span>
                            {isBest && <span className="text-xs px-1.5 rounded font-medium" style={{ backgroundColor: "var(--good)", color: "oklch(0.2 0.04 155)" }}>migliore</span>}
                            {!disponibile && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--surface-3)", color: "var(--ink-3)" }}>Non disponibile</span>}
                            {p.paese && <span className="text-xs" style={{ color: "var(--ink-4)" }}>{p.paese}</span>}
                            {p.rilevato_at && (
                              <span className="text-xs" style={{ color: "var(--ink-4)" }}>{timeAgo(p.rilevato_at as string)}</span>
                            )}
                          </div>
                          {p.codice_sconto && disponibile && (
                            <p className="text-xs mt-0.5" style={{ color: "oklch(0.82 0.12 75)" }}>Coupon: {p.codice_sconto}</p>
                          )}
                          {(() => {
                            const hasSRule = p.shipping_costo != null;
                            const prezzo = Number(p.prezzo_finale);
                            const soglia = p.shipping_soglia_gratis != null ? Number(p.shipping_soglia_gratis) : null;
                            const isFree = hasSRule && soglia != null && prezzo >= soglia;
                            const costo = hasSRule ? Number(p.shipping_costo) : Number(p.prezzo_spedizione);
                            const giorni = p.shipping_giorni_min && p.shipping_giorni_max
                              ? `${p.shipping_giorni_min}–${p.shipping_giorni_max}gg`
                              : null;
                            if (!disponibile) return null;
                            const spedLabel = isFree || (!hasSRule && costo === 0)
                              ? "Spedizione gratuita"
                              : `+€${costo.toFixed(2)} sped.${soglia != null ? ` · gratis >€${soglia.toFixed(0)}` : ""}`;
                            const extra = [p.shipping_corriere, giorni].filter(Boolean).join(" · ");
                            return (
                              <div className="mt-0.5 space-y-0.5">
                                <p className="text-xs" style={{ color: isFree || (!hasSRule && costo === 0) ? "var(--good)" : "var(--ink-4)" }}>
                                  {spedLabel}
                                  {extra && <span className="ml-1" style={{ color: "var(--ink-4)" }}>· {extra}</span>}
                                </p>
                                {p.shipping_note && (
                                  <p className="text-xs italic truncate" style={{ color: "var(--ink-4)" }}>{p.shipping_note}</p>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Colonna destra — dimensione fissa, non comprimibile */}
                        <div className="shrink-0 text-right">
                          {disponibile ? (
                            <>
                              {p.prezzo_scontato && (
                                <div className="text-xs line-through" style={{ color: "var(--ink-4)" }}>€ {Number(p.prezzo).toFixed(2)}</div>
                              )}
                              <div className="font-bold text-base" style={{ color: isBest ? "var(--good)" : "var(--ink-1)" }}>
                                €&nbsp;{Number(p.prezzo_finale).toFixed(2)}
                              </div>
                              {p.prezzo_per_kg && (
                                <div className="text-xs" style={{ color: "var(--ink-4)" }}>{Number(p.prezzo_per_kg).toFixed(2)}/kg</div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs" style={{ color: "var(--ink-4)" }}>€ {Number(p.prezzo_finale).toFixed(2)}</div>
                          )}
                          <span className="text-xs mt-1 inline-block group-hover:underline" style={{ color: disponibile ? "var(--accent)" : "var(--ink-4)" }}>
                            {disponibile ? "Vai →" : "Visita →"}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grafico storico prezzi */}
            {storicoSerializable.length > 0 && (
              <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                <h2 className="text-base font-semibold mb-4">Storico prezzi</h2>
                <PriceChart data={storicoSerializable} height={200} />
              </div>
            )}

            {/* Stampanti compatibili */}
            {stampanti.length > 0 && (
              <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}>
                <h2 className="text-base font-semibold mb-4">Compatibilità stampanti</h2>
                <div className="flex flex-wrap gap-2">
                  {stampanti.map((p) => (
                    <div
                      key={p.id}
                      title={p.note ?? undefined}
                      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border"
                      style={
                        p.compatibile
                          ? { backgroundColor: "var(--good-quiet)", borderColor: "var(--good)", color: "var(--good)" }
                          : { backgroundColor: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink-4)", textDecoration: "line-through" }
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.compatibile ? "var(--good)" : "var(--ink-4)" }} />
                      {p.brand ? `${p.brand} ` : ""}{p.nome}
                      <span style={{ color: "var(--ink-4)" }}>⌀{p.diametro_mm}mm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
