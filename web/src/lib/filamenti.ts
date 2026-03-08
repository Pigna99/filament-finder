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
  prezzo_max?: number;
  q?: string;
}

// ----------------------------------------------------------------
// getCatalogo — lista filamenti con filtri dinamici
// ----------------------------------------------------------------
export async function getCatalogo(filters: CatalogoFilters = {}): Promise<FilamentoRow[]> {
  const rows = await sql<FilamentoRow[]>`
    SELECT *
    FROM v_filament_full
    WHERE TRUE
      ${filters.tipo ? sql`AND tipo = ${filters.tipo}` : sql``}
      ${filters.brand ? sql`AND brand = ${filters.brand}` : sql``}
      ${filters.diametro ? sql`AND diametro_mm = ${filters.diametro}` : sql``}
      ${filters.colore_famiglia ? sql`AND colore_famiglia = ${filters.colore_famiglia}` : sql``}
      ${filters.prezzo_max ? sql`AND (prezzo_per_kg_min IS NULL OR prezzo_per_kg_min <= ${filters.prezzo_max})` : sql``}
      ${filters.q ? sql`AND (colore ILIKE ${"%" + filters.q + "%"} OR brand ILIKE ${"%" + filters.q + "%"})` : sql``}
    ORDER BY prezzo_per_kg_min ASC NULLS LAST
  `;
  return rows;
}

// ----------------------------------------------------------------
// getFilamentoBySlug — filamento singolo da slug
// Cerca prima per slug generato (in-memory), poi per ID come fallback
// ----------------------------------------------------------------
export async function getFilamentoBySlug(slug: string): Promise<FilamentoRow | null> {
  // Extract peso_g from slug suffix (e.g. "bambu-pla-matte-black-1000g" → 1000)
  // to narrow the query significantly instead of loading all rows
  const pesoMatch = slug.match(/-(\d+)g$/);
  const pesoG = pesoMatch ? parseInt(pesoMatch[1]) : null;

  const rows = pesoG
    ? await sql<FilamentoRow[]>`SELECT * FROM v_filament_full WHERE peso_g = ${pesoG}`
    : await sql<FilamentoRow[]>`SELECT * FROM v_filament_full`;

  return (
    rows.find(
      (r) =>
        slugifyFilamento(r.brand, r.tipo, r.variante, r.colore, r.peso_g) === slug
    ) ?? null
  );
}

// ----------------------------------------------------------------
// getPrezziShop — prezzi correnti per negozio per un filamento
// ----------------------------------------------------------------
export async function getPrezziShop(id_filament: number): Promise<PrezzoShop[]> {
  return sql<PrezzoShop[]>`
    SELECT
      vpl.*,
      s.nome  AS shop,
      s.paese
    FROM v_price_latest vpl
    JOIN shop s ON s.id = vpl.id_shop
    WHERE vpl.id_filament = ${id_filament}
    ORDER BY vpl.disponibile DESC, vpl.prezzo_finale ASC
  `;
}

// ----------------------------------------------------------------
// getStoricoPrezzi — storico prezzi per grafico
// ----------------------------------------------------------------
export async function getStoricoPrezzi(id_filament: number): Promise<PuntoStorico[]> {
  return sql<PuntoStorico[]>`
    SELECT
      rilevato_at,
      prezzo_finale,
      prezzo_per_kg,
      shop,
      id_filament_shop
    FROM v_price_history_full
    WHERE id_filament = ${id_filament}
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
