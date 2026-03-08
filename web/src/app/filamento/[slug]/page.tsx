import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PriceChart from "@/components/PriceChart";
import {
  getFilamentoBySlug,
  getPrezziShop,
  getStoricoPrezzi,
  getTags,
} from "@/lib/filamenti";

export const revalidate = 900;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFilamentoBySlug(slug).catch(() => null);
  if (!f) return { title: "Filamento non trovato" };
  return {
    title: `${f.brand} ${f.tipo} ${f.variante} ${f.colore ?? ""} ${f.peso_g}g`,
    description: `Confronta i prezzi di ${f.brand} ${f.tipo} ${f.variante} su tutti gli shop. Storico prezzi e caratteristiche tecniche.`,
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

  const [prezziShop, storico, tags] = await Promise.all([
    getPrezziShop(f.id).catch(() => []),
    getStoricoPrezzi(f.id).catch(() => []),
    getTags(f.id).catch(() => []),
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${f.brand} ${f.tipo} ${f.variante}${f.colore ? ` ${f.colore}` : ""} ${f.peso_g}g`,
    description: `Filamento ${f.tipo} di ${f.brand}. Diametro: ${f.diametro_mm}mm.`,
    brand: { "@type": "Brand", name: f.brand },
    ...(f.link_immagine ? { image: f.link_immagine } : {}),
    url: `${base}/filamento/${slug}`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-6">
          <a href="/" className="hover:text-zinc-300">Home</a>
          <span className="mx-2">›</span>
          <a href="/catalogo" className="hover:text-zinc-300">Catalogo</a>
          <span className="mx-2">›</span>
          <a href={`/catalogo?tipo=${f.tipo}`} className="hover:text-zinc-300">{f.tipo}</a>
          <span className="mx-2">›</span>
          <span className="text-zinc-300">{f.brand} {f.variante} {f.colore}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna sinistra: info filamento */}
          <div className="lg:col-span-1">
            {/* Immagine / swatch */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-center h-48 mb-4">
              {f.link_immagine ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.link_immagine} alt={`${f.brand} ${f.variante}`} className="max-h-36 object-contain" />
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-4 border-zinc-700 shadow-inner"
                  style={{ backgroundColor: f.colore_hex ?? "#3f3f46" }}
                />
              )}
            </div>

            {/* Badge tipo */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-zinc-800 text-emerald-400 text-xs font-mono px-3 py-1 rounded-full">{f.tipo}</span>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full">{f.variante}</span>
              {tags.map(t => (
                <span key={t.id} className="bg-zinc-800 text-zinc-500 text-xs px-2 py-1 rounded-full" title={t.descrizione ?? ""}>
                  {t.nome}
                </span>
              ))}
            </div>

            {/* Info base */}
            <h1 className="text-xl font-bold text-zinc-100 mb-1">
              {f.brand} {f.tipo} {f.variante}
            </h1>
            {f.colore && (
              <div className="flex items-center gap-2 mb-4">
                {f.colore_hex && <span className="w-4 h-4 rounded-full border border-zinc-700" style={{ backgroundColor: f.colore_hex }} />}
                <span className="text-zinc-400">{f.colore}</span>
              </div>
            )}

            {/* Specifiche */}
            <div className="space-y-2 text-sm">
              {[
                ["Peso", `${f.peso_g} g`],
                ["Diametro", `${f.diametro_mm} mm`],
                ["SKU", f.sku],
                ["Densità", f.densita_g_cm3 ? `${f.densita_g_cm3} g/cm³` : null],
                ["Rating", f.rating_medio ? `${f.rating_medio}/5 (${f.num_recensioni} rec.)` : null],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={String(label)} className="flex justify-between">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-300">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colonna destra: prezzi e caratteristiche tecniche */}
          <div className="lg:col-span-2 space-y-6">

            {/* Caratteristiche tecniche */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Caratteristiche tecniche</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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
                    <span className="text-zinc-500 text-xs">{label}</span>
                    <p className="text-zinc-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prezzi per shop */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                Prezzi attuali per shop
              </h2>
              {prezziShopSerializable.length === 0 ? (
                <p className="text-zinc-500 text-sm">Nessun prezzo disponibile.</p>
              ) : (
                <div className="space-y-3">
                  {prezziShopSerializable.map((p, i) => {
                    const disponibile = p.disponibile;
                    const isBest = disponibile && i === 0;
                    return (
                      <div key={p.id_filament_shop} className={`flex items-center justify-between p-3 rounded-xl ${
                        !disponibile ? "bg-zinc-800/20 border border-zinc-800/30 opacity-60" :
                        isBest ? "bg-emerald-950/50 border border-emerald-800/50" : "bg-zinc-800/50"
                      }`}>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${disponibile ? "text-zinc-100" : "text-zinc-500"}`}>{p.shop}</span>
                            {isBest && <span className="text-xs bg-emerald-600 text-white px-1.5 rounded">migliore</span>}
                            {!disponibile && <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">Non disponibile</span>}
                            {p.paese && <span className="text-xs text-zinc-600">{p.paese}</span>}
                            {p.rilevato_at && (
                              <span className="text-xs text-zinc-600">{timeAgo(p.rilevato_at as string)}</span>
                            )}
                          </div>
                          {p.codice_sconto && disponibile && (
                            <span className="text-xs text-amber-400">Coupon: {p.codice_sconto}</span>
                          )}
                          {p.prezzo_spedizione > 0 && disponibile && (
                            <span className="text-xs text-zinc-500"> + €{Number(p.prezzo_spedizione).toFixed(2)} spedizione</span>
                          )}
                        </div>
                        <div className="text-right">
                          {disponibile ? (
                            <>
                              {p.prezzo_scontato && (
                                <div className="text-xs text-zinc-500 line-through">€ {Number(p.prezzo).toFixed(2)}</div>
                              )}
                              <div className={`font-bold ${isBest ? "text-emerald-400" : "text-zinc-100"}`}>
                                € {Number(p.prezzo_finale).toFixed(2)}
                              </div>
                              {p.prezzo_per_kg && (
                                <div className="text-xs text-zinc-500">€ {Number(p.prezzo_per_kg).toFixed(2)}/kg</div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-zinc-600 mb-1">ultimo: € {Number(p.prezzo_finale).toFixed(2)}</div>
                          )}
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs mt-1 inline-block ${disponibile ? "text-emerald-400 hover:underline" : "text-zinc-600 hover:text-zinc-400"}`}
                          >
                            {disponibile ? "Vai al prodotto →" : "Visita pagina →"}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grafico storico prezzi */}
            {storicoSerializable.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                  Storico prezzi
                </h2>
                <PriceChart data={storicoSerializable} height={200} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
