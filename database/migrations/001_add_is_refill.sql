-- Migration 001: aggiungi is_refill a filament
-- Eseguire su VPS: psql -U filament_app filament_finder -f 001_add_is_refill.sql

ALTER TABLE filament
    ADD COLUMN IF NOT EXISTS is_refill BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN filament.is_refill IS 'TRUE se venduto senza bobina (refill/cardboard spool)';

-- Ricrea la view v_filament_full per includere is_refill
CREATE OR REPLACE VIEW v_filament_full AS
SELECT
    f.id,
    f.sku,
    f.peso_g,
    f.diametro_mm,
    f.colore,
    f.colore_hex,
    f.colore_famiglia,
    f.link_immagine,
    f.densita_g_cm3,
    f.humidity_sensitive,
    f.rating_medio,
    f.num_recensioni,
    f.is_refill,
    f.created_at,
    -- Brand
    b.id                AS id_brand,
    b.nome              AS brand,
    b.logo              AS brand_logo,
    -- Tipo e variante
    ft.id               AS id_type,
    ft.nome             AS tipo,
    fv.id               AS id_variant,
    fv.nome             AS variante,
    -- Proprietà tecniche effettive (via v_filament_props)
    vp.flessibile,
    vp.igroscopico,
    vp.difficolta_stampa,
    vp.temp_stampa_min,
    vp.temp_stampa_max,
    vp.temp_piatto_min,
    vp.temp_piatto_max,
    vp.richiede_enclosure,
    vp.food_safe,
    -- Miglior prezzo attuale (minimo tra tutti gli shop attivi)
    best.prezzo_min,
    best.prezzo_per_kg_min,
    best.num_shop
FROM filament f
JOIN brand            b  ON b.id  = f.id_brand
JOIN filament_variant fv ON fv.id = f.id_variant
JOIN filament_type    ft ON ft.id = fv.id_type
JOIN v_filament_props vp ON vp.id_variant = fv.id
-- Miglior prezzo aggregato
LEFT JOIN LATERAL (
    SELECT
        MIN(vpl.prezzo_finale)      AS prezzo_min,
        MIN(vpl.prezzo_per_kg)      AS prezzo_per_kg_min,
        COUNT(*)                    AS num_shop
    FROM v_price_latest vpl
    WHERE vpl.id_filament = f.id
      AND vpl.disponibile = TRUE
) best ON TRUE
WHERE f.attivo = TRUE;
