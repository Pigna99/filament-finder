import { sql } from "./db";
import { slugifyFilamento } from "./slugify";

export interface FilamentoRow {
  id: number;
  sku: string | null;
  peso_g: number;
  diametro_mm: number;
  colore: string | null;
  colore_hex: string | null;
  colore_famiglia: string | null;
  link_immagine: string | null;
  link_brand: string | null;
  densita_g_cm3: number | null;
  humidity_sensitive: boolean;
  is_refill: boolean;
  rating_medio: number | null;
  num_recensioni: number;
  // Brand
  id_brand: number;
  brand: string;
  brand_logo: string | null;
  // Tipo + variante
  id_type: number;
  tipo: string;
  id_variant: number;
  variante: string;
  // Proprietà tecniche effettive
  flessibile: boolean;
  igroscopico: boolean;
  difficolta_stampa: number | null;
  temp_stampa_min: number | null;
  temp_stampa_max: number | null;
  temp_piatto_min: number | null;
  temp_piatto_max: number | null;
  richiede_enclosure: boolean;
  food_safe: boolean;
  // Prezzi aggregati
  prezzo_min: number | null;
  prezzo_per_kg_min: number | null;
  num_shop: bigint | number;
}

export interface PrezzoShop {
  id_filament_shop: number;
  id_shop: number;
  shop: string;
  paese: string | null;
  link: string;
  affiliazione: boolean;
  codice_sconto: string | null;
  prezzo: number;
  prezzo_spedizione: number;
  sconto_percentuale: number | null;
  prezzo_scontato: number | null;
  prezzo_finale: number;
  prezzo_totale: number;
  prezzo_per_kg: number | null;
  disponibile: boolean;
  rilevato_at: Date;
  // Regola spedizione del negozio (null se non configurata)
  shipping_costo: number | null;
  shipping_soglia_gratis: number | null;
  shipping_corriere: string | null;
  shipping_giorni_min: number | null;
  shipping_giorni_max: number | null;
  shipping_note: string | null;
}

export interface ShopShippingRule {
  id: number;
  id_shop: number;
  shop_nome: string;
  costo: number;
  soglia_gratis: number | null;
  corriere: string | null;
  giorni_min: number | null;
  giorni_max: number | null;
  note: string | null;
}

export interface PuntoStorico {
  rilevato_at: Date;
  prezzo_finale: number;
  prezzo_per_kg: number | null;
  shop: string;
  id_filament_shop: number;
}

export interface TagRow {
  id: number;
  nome: string;
  descrizione: string | null;
}

export interface CatalogoFilters {
  tipo?: string;
  brand?: string;
  diametro?: number;
  colore_famiglia?: string;
  prezzo_max?: number;     // max €/kg
  prezzo_abs_max?: number; // max prezzo assoluto (€)
  peso?: number;
  q?: string;
  refill?: "yes" | "no";  // "yes" = solo refill, "no" = solo con bobina
  disponibile?: boolean;  // true = solo con almeno uno shop disponibile
}

// ----------------------------------------------------------------
// getCatalogo — lista filamenti con filtri dinamici
// ----------------------------------------------------------------
export async function getCatalogo(filters: CatalogoFilters = {}): Promise<FilamentoRow[]> {
  const qLike = filters.q ? "%" + filters.q + "%" : null;
  const rows = await sql<FilamentoRow[]>`
    SELECT *
    FROM v_filament_full
    WHERE TRUE
      ${filters.tipo ? sql`AND tipo = ${filters.tipo}` : sql``}
      ${filters.brand ? sql`AND brand = ${filters.brand}` : sql``}
      ${filters.diametro ? sql`AND diametro_mm = ${filters.diametro}` : sql``}
      ${filters.colore_famiglia ? sql`AND colore_famiglia = ${filters.colore_famiglia}` : sql``}
      ${filters.peso ? sql`AND peso_g = ${filters.peso}` : sql``}
      ${filters.prezzo_max ? sql`AND (prezzo_per_kg_min IS NULL OR prezzo_per_kg_min <= ${filters.prezzo_max})` : sql``}
      ${filters.prezzo_abs_max ? sql`AND prezzo_min IS NOT NULL AND prezzo_min <= ${filters.prezzo_abs_max}` : sql``}
      ${filters.disponibile ? sql`AND num_shop > 0` : sql``}
      ${qLike ? sql`AND (
        colore ILIKE ${qLike}
        OR brand ILIKE ${qLike}
        OR tipo ILIKE ${qLike}
        OR variante ILIKE ${qLike}
        OR colore_famiglia ILIKE ${qLike}
      )` : sql``}
      ${filters.refill === "yes" ? sql`AND is_refill = TRUE` : filters.refill === "no" ? sql`AND is_refill = FALSE` : sql``}
    ORDER BY prezzo_per_kg_min ASC NULLS LAST
  `;
  return rows;
}

// ----------------------------------------------------------------
// getFilamentoBySlug — filamento singolo da slug
// Cerca prima per slug generato (in-memory), poi per ID come fallback
// ----------------------------------------------------------------
// Tipos noti ordinati dal più specifico al più generico (per matching slug)
const SLUG_TIPOS = [
  "petg-cf","pla-cf","pa-cf","pet-cf","paht-cf","petg","pla","abs","asa",
  "tpu","nylon","pa","pc","hips","pva",
];

export async function getFilamentoBySlug(slug: string): Promise<FilamentoRow | null> {
  // Estrae peso_g dal suffisso (es. "bambu-pla-matte-black-1000g" → 1000)
  const pesoMatch = slug.match(/-(\d+)g(?:-refill)?$/);
  const pesoG = pesoMatch ? parseInt(pesoMatch[1]) : null;

  // Estrae tipo dal slug controllando i pattern noti (dal più specifico)
  const tipoSlug = SLUG_TIPOS.find((t) => slug.includes(`-${t}-`) || slug.endsWith(`-${t}`));
  const tipoFilter = tipoSlug ? tipoSlug.toUpperCase() : null;

  const rows = await sql<FilamentoRow[]>`
    SELECT * FROM v_filament_full
    WHERE TRUE
      ${pesoG ? sql`AND peso_g = ${pesoG}` : sql``}
      ${tipoFilter ? sql`AND tipo = ${tipoFilter}` : sql``}
  `;

  return (
    rows.find(
      (r) =>
        slugifyFilamento(r.brand, r.tipo, r.variante, r.colore, r.peso_g, r.is_refill) === slug
    ) ?? null
  );
}

// ----------------------------------------------------------------
// getPrezziShop — prezzi correnti per negozio per un filamento
// ----------------------------------------------------------------
export async function getPrezziShop(id_filament: number): Promise<PrezzoShop[]> {
  // Se esiste una riga "Elegoo IT" (Impact, con affiliazione) per questo filamento,
  // sopprimiamo "Elegoo" (Shopify EU, senza affiliazione) per evitare duplicati.
  return sql<PrezzoShop[]>`
    SELECT * FROM (
      SELECT DISTINCT ON (s.nome)
        vpl.*,
        s.nome  AS shop,
        s.paese,
        ss.costo            AS shipping_costo,
        ss.soglia_gratis    AS shipping_soglia_gratis,
        ss.corriere         AS shipping_corriere,
        ss.giorni_min       AS shipping_giorni_min,
        ss.giorni_max       AS shipping_giorni_max,
        ss.note             AS shipping_note
      FROM v_price_latest vpl
      JOIN shop s ON s.id = vpl.id_shop
      LEFT JOIN shop_shipping ss ON ss.id_shop = s.id
      WHERE vpl.id_filament = ${id_filament}
        AND NOT (
          s.nome = 'Elegoo'
          AND EXISTS (
            SELECT 1 FROM v_price_latest vpl2
            JOIN shop s2 ON s2.id = vpl2.id_shop
            WHERE vpl2.id_filament = ${id_filament}
              AND s2.nome = 'Elegoo IT'
          )
        )
      ORDER BY s.nome, vpl.disponibile DESC, vpl.prezzo_finale ASC
    ) sub
    ORDER BY sub.disponibile DESC, sub.prezzo_finale ASC
  `;
}

// ----------------------------------------------------------------
// getStoricoPrezzi — storico prezzi per grafico
// ----------------------------------------------------------------
export async function getStoricoPrezzi(id_filament: number): Promise<PuntoStorico[]> {
  // Stessa logica di getPrezziShop: se esiste "Elegoo IT" (Impact), sopprime "Elegoo" (Shopify EU)
  return sql<PuntoStorico[]>`
    SELECT
      rilevato_at,
      prezzo_finale,
      prezzo_per_kg,
      shop,
      id_filament_shop
    FROM v_price_history_full vph
    WHERE id_filament = ${id_filament}
      AND NOT (
        vph.shop = 'Elegoo'
        AND EXISTS (
          SELECT 1 FROM v_price_history_full vph2
          WHERE vph2.id_filament = ${id_filament}
            AND vph2.shop = 'Elegoo IT'
        )
      )
    ORDER BY rilevato_at ASC
  `;
}

// ----------------------------------------------------------------
// getTopFilamenti — top N per prezzo/kg (per homepage)
// ----------------------------------------------------------------
export async function getTopFilamenti(limit = 6): Promise<FilamentoRow[]> {
  return sql<FilamentoRow[]>`
    SELECT *
    FROM v_filament_full
    WHERE prezzo_per_kg_min IS NOT NULL
    ORDER BY prezzo_per_kg_min ASC
    LIMIT ${limit}
  `;
}

// ----------------------------------------------------------------
// FilamentoScontato — filamento con sconto attivo
// ----------------------------------------------------------------
export interface FilamentoScontato extends FilamentoRow {
  sconto_percentuale: number;
  prezzo_originale_sconto: number;
  shop_sconto: string;
}

// getFilamentiScontati — filamenti con sconto attivo, ordinati per sconto %
// ----------------------------------------------------------------
export async function getFilamentiScontati(limit = 6): Promise<FilamentoScontato[]> {
  return sql<FilamentoScontato[]>`
    SELECT DISTINCT ON (f.id)
      f.*,
      ph.sconto_percentuale,
      ph.prezzo        AS prezzo_originale_sconto,
      ph.prezzo_scontato,
      s.nome           AS shop_sconto
    FROM v_filament_full f
    JOIN filament_shop fs ON fs.id_filament = f.id
    JOIN shop s ON s.id = fs.id_shop
    JOIN LATERAL (
      SELECT *
      FROM price_history p
      WHERE p.id_filament_shop = fs.id
        AND p.sconto_percentuale IS NOT NULL
        AND p.disponibile = TRUE
      ORDER BY p.rilevato_at DESC
      LIMIT 1
    ) ph ON TRUE
    WHERE ph.sconto_percentuale > 5
    ORDER BY f.id, ph.sconto_percentuale DESC
    LIMIT ${limit}
  `;
}

// ----------------------------------------------------------------
// getSiteStats — statistiche homepage (filamenti, shop)
// ----------------------------------------------------------------
export async function getSiteStats(): Promise<{ num_filamenti: number; num_shop: number; num_brand: number }> {
  const rows = await sql<{ num_filamenti: string; num_shop: string; num_brand: string }[]>`
    SELECT
      (SELECT COUNT(*) FROM filament WHERE attivo = TRUE)::text AS num_filamenti,
      (SELECT COUNT(*) FROM shop    WHERE attivo = TRUE)::text AS num_shop,
      (SELECT COUNT(*) FROM brand)::text                       AS num_brand
  `;
  return {
    num_filamenti: parseInt(rows[0]?.num_filamenti ?? "0"),
    num_shop: parseInt(rows[0]?.num_shop ?? "0"),
    num_brand: parseInt(rows[0]?.num_brand ?? "0"),
  };
}

// ----------------------------------------------------------------
// getVariantiModello — tutte le varianti dello stesso modello (brand+tipo+variante)
// include tutti i colori, tutti i pesi e varianti refill
// ----------------------------------------------------------------
export interface VarianteModello {
  id: number;
  colore: string | null;
  colore_hex: string | null;
  peso_g: number;
  is_refill: boolean;
  slug: string;
}

export async function getVariantiModello(
  id_brand: number,
  id_type: number,
  id_variant: number,
): Promise<VarianteModello[]> {
  const rows = await sql<FilamentoRow[]>`
    SELECT *
    FROM v_filament_full
    WHERE id_brand   = ${id_brand}
      AND id_type    = ${id_type}
      AND id_variant = ${id_variant}
    ORDER BY colore ASC, peso_g ASC, is_refill ASC
  `;
  return rows.map((r) => ({
    id: r.id,
    colore: r.colore,
    colore_hex: r.colore_hex,
    peso_g: r.peso_g,
    is_refill: r.is_refill,
    slug: slugifyFilamento(r.brand, r.tipo, r.variante, r.colore, r.peso_g, r.is_refill),
  }));
}

// ----------------------------------------------------------------
// getTags — tag di un filamento
// ----------------------------------------------------------------
export async function getTags(id_filament: number): Promise<TagRow[]> {
  return sql<TagRow[]>`
    SELECT t.id, t.nome, t.descrizione
    FROM tag t
    JOIN filament_tag ft ON ft.id_tag = t.id
    WHERE ft.id_filament = ${id_filament}
    ORDER BY t.nome
  `;
}

// ----------------------------------------------------------------
// Helpers per i selects dell'admin e dei filtri
// ----------------------------------------------------------------
export async function getTipiDistinti(): Promise<string[]> {
  const rows = await sql<{ nome: string }[]>`SELECT nome FROM filament_type ORDER BY nome`;
  return rows.map((r) => r.nome);
}

export async function getBrandsDistinti(): Promise<string[]> {
  const rows = await sql<{ nome: string }[]>`SELECT nome FROM brand WHERE attivo = TRUE ORDER BY nome`;
  return rows.map((r) => r.nome);
}

export async function getColoriFamiglie(): Promise<string[]> {
  const rows = await sql<{ colore_famiglia: string }[]>`
    SELECT DISTINCT colore_famiglia
    FROM filament
    WHERE colore_famiglia IS NOT NULL
    ORDER BY colore_famiglia
  `;
  return rows.map((r) => r.colore_famiglia);
}

// ----------------------------------------------------------------
// getCompatibiliPrinters — stampanti compatibili con una variante
// ----------------------------------------------------------------
export interface PrinterCompat {
  id: number;
  nome: string;
  brand: string | null;
  diametro_mm: number;
  ha_enclosure: boolean;
  max_temp_hotend: number | null;
  compatibile: boolean;
  note: string | null;
}

export async function getCompatibiliPrinters(id_variant: number): Promise<PrinterCompat[]> {
  return sql<PrinterCompat[]>`
    SELECT
      pp.id, pp.nome, pp.brand, pp.diametro_mm, pp.ha_enclosure, pp.max_temp_hotend,
      fvp.compatibile, fvp.note
    FROM filament_variant_printer fvp
    JOIN printer_profile pp ON pp.id = fvp.id_printer
    WHERE fvp.id_variant = ${id_variant}
      AND pp.attivo = TRUE
    ORDER BY fvp.compatibile DESC, pp.brand, pp.nome
  `;
}

// ----------------------------------------------------------------
// getFilamentiByIds — batch fetch per pagina confronto
// ----------------------------------------------------------------
export async function getFilamentiByIds(ids: number[]): Promise<FilamentoRow[]> {
  if (ids.length === 0) return [];
  return sql<FilamentoRow[]>`
    SELECT * FROM v_filament_full
    WHERE id = ANY(${ids}::int[])
    ORDER BY array_position(${ids}::int[], id)
  `;
}

// ----------------------------------------------------------------
// getAllBrands — lista brand per generateStaticParams
// ----------------------------------------------------------------
export async function getAllBrands(): Promise<{ nome: string; slug: string }[]> {
  const rows = await sql<{ nome: string }[]>`
    SELECT DISTINCT brand AS nome FROM v_filament_full ORDER BY brand
  `;
  return rows.map(r => ({
    nome: r.nome,
    slug: r.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  }));
}

// ----------------------------------------------------------------
// getAllTipi — lista tipi per generateStaticParams
// ----------------------------------------------------------------
export async function getAllTipi(): Promise<string[]> {
  const rows = await sql<{ tipo: string }[]>`
    SELECT DISTINCT tipo FROM v_filament_full ORDER BY tipo
  `;
  return rows.map(r => r.tipo);
}

// ----------------------------------------------------------------
// getStoricoPrezziMulti — storico prezzi per più filamenti (pagina confronto)
// ----------------------------------------------------------------
export async function getStoricoPrezziMulti(ids: number[]): Promise<Record<number, PuntoStorico[]>> {
  if (ids.length === 0) return {};
  const rows = await sql<(PuntoStorico & { id_filament: number })[]>`
    SELECT
      id_filament, rilevato_at, prezzo_finale, prezzo_per_kg, shop, id_filament_shop
    FROM v_price_history_full vph
    WHERE id_filament = ANY(${ids}::int[])
      AND NOT (
        vph.shop = 'Elegoo'
        AND EXISTS (
          SELECT 1 FROM v_price_history_full vph2
          WHERE vph2.id_filament = vph.id_filament AND vph2.shop = 'Elegoo IT'
        )
      )
    ORDER BY id_filament, rilevato_at ASC
  `;
  const result: Record<number, PuntoStorico[]> = {};
  for (const r of rows) {
    if (!result[r.id_filament]) result[r.id_filament] = [];
    result[r.id_filament].push(r);
  }
  return result;
}

// ----------------------------------------------------------------
// getElegooPromos — offerte, coupon e banner attivi da Impact
// ----------------------------------------------------------------
export interface ElegooPromo {
  id: string;
  tipo: "deal" | "banner";
  nome: string | null;
  descrizione: string | null;
  codice: string | null;
  sconto_tipo: string | null;
  sconto_valore: number | null;
  sconto_valuta: string | null;
  scope: string | null;
  prodotti: unknown;
  banner_url: string | null;
  tracking_link: string | null;
  larghezza: number | null;
  altezza: number | null;
  data_fine: Date | null;
}

export async function getElegooPromos(): Promise<{ deals: ElegooPromo[]; banners: ElegooPromo[] }> {
  const rows = await sql<ElegooPromo[]>`
    SELECT
      id, tipo, nome, descrizione, codice, sconto_tipo,
      sconto_valore, sconto_valuta, scope, prodotti,
      banner_url, tracking_link, larghezza, altezza, data_fine
    FROM elegoo_promo
    WHERE attivo = TRUE
    ORDER BY tipo, aggiornato_at DESC
  `;
  return {
    deals:   rows.filter(r => r.tipo === "deal"),
    banners: rows.filter(r => r.tipo === "banner"),
  };
}

// ----------------------------------------------------------------
// getBrandStats — statistiche brand per pagina brand
// ----------------------------------------------------------------
export async function getBrandStats(brand: string): Promise<{
  num_filamenti: number;
  num_shop: number;
  prezzo_min: number | null;
  tipi: string[];
} | null> {
  const rows = await sql<{ num_filamenti: string; num_shop: string; prezzo_min: string | null; tipi: string }[]>`
    SELECT
      COUNT(*)::text                                    AS num_filamenti,
      COUNT(DISTINCT CASE WHEN num_shop > 0 THEN 1 END)::text AS num_shop,
      MIN(prezzo_min)::text                             AS prezzo_min,
      array_agg(DISTINCT tipo ORDER BY tipo)::text      AS tipi
    FROM v_filament_full
    WHERE brand = ${brand}
  `;
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    num_filamenti: parseInt(r.num_filamenti ?? "0"),
    num_shop: parseInt(r.num_shop ?? "0"),
    prezzo_min: r.prezzo_min ? parseFloat(r.prezzo_min) : null,
    tipi: r.tipi ? r.tipi.replace(/[{}"]/g, "").split(",").filter(Boolean) : [],
  };
}
