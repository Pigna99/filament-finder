-- ============================================================
-- FILAMENT FINDER — VIEWS
-- Da eseguire DOPO schema.sql
-- ============================================================

-- ============================================================
-- v_filament_props
-- Proprietà tecniche effettive per ogni variante,
-- usando COALESCE(variante.prop, tipo.prop) per l'ereditarietà.
-- ============================================================
CREATE OR REPLACE VIEW v_filament_props AS
SELECT
    fv.id                                                           AS id_variant,
    fv.nome                                                         AS variante,
    ft.id                                                           AS id_type,
    ft.nome                                                         AS tipo,
    COALESCE(fv.flessibile,         ft.flessibile)                  AS flessibile,
    COALESCE(fv.igroscopico,        ft.igroscopico)                 AS igroscopico,
    COALESCE(fv.difficolta_stampa,  ft.difficolta_stampa)           AS difficolta_stampa,
    COALESCE(fv.temp_stampa_min,    ft.temp_stampa_min)             AS temp_stampa_min,
    COALESCE(fv.temp_stampa_max,    ft.temp_stampa_max)             AS temp_stampa_max,
    COALESCE(fv.temp_piatto_min,    ft.temp_piatto_min)             AS temp_piatto_min,
    COALESCE(fv.temp_piatto_max,    ft.temp_piatto_max)             AS temp_piatto_max,
    COALESCE(fv.richiede_enclosure, ft.richiede_enclosure)          AS richiede_enclosure,
    COALESCE(fv.food_safe,          ft.food_safe)                   AS food_safe
FROM filament_variant fv
JOIN filament_type ft ON ft.id = fv.id_type;

COMMENT ON VIEW v_filament_props IS
    'Proprietà tecniche effettive di ogni variante: COALESCE(variante.prop, tipo.prop). Usa questa view invece di joinare manualmente tipo e variante.';

-- ============================================================
-- v_price_latest
-- Ultimo prezzo rilevato per ogni link filament_shop,
-- con calcolo €/kg e prezzo finale (scontato o base).
-- Usa LATERAL per prendere l'ultima riga per id_filament_shop.
-- ============================================================
CREATE OR REPLACE VIEW v_price_latest AS
SELECT
    fs.id                                                           AS id_filament_shop,
    fs.id_filament,
    fs.id_shop,
    fs.link,
    fs.affiliazione,
    fs.codice_sconto,
    ph.prezzo,
    ph.prezzo_spedizione,
    ph.sconto_percentuale,
    ph.prezzo_scontato,
    ph.disponibile,
    ph.rilevato_at,
    -- Prezzo finale: usa prezzo_scontato se presente, altrimenti prezzo base
    COALESCE(ph.prezzo_scontato, ph.prezzo)                         AS prezzo_finale,
    -- Prezzo totale (prodotto + spedizione)
    COALESCE(ph.prezzo_scontato, ph.prezzo) + ph.prezzo_spedizione  AS prezzo_totale,
    -- €/kg calcolato sul prezzo finale
    CASE
        WHEN f.peso_g > 0 THEN
            ROUND(
                (COALESCE(ph.prezzo_scontato, ph.prezzo) / f.peso_g * 1000)::NUMERIC,
                2
            )
    END                                                             AS prezzo_per_kg
FROM filament_shop fs
JOIN filament f ON f.id = fs.id_filament
-- LATERAL: per ogni fs prende l'unica riga più recente di price_history
JOIN LATERAL (
    SELECT *
    FROM price_history
    WHERE id_filament_shop = fs.id
    ORDER BY rilevato_at DESC
    LIMIT 1
) ph ON TRUE
WHERE fs.attivo = TRUE;

COMMENT ON VIEW v_price_latest IS
    'Ultimo prezzo rilevato per ogni link di acquisto attivo. Include prezzo_finale, prezzo_totale (+ spedizione) e prezzo_per_kg calcolati.';

-- ============================================================
-- v_filament_full
-- Vista completa: filament + brand + tipo + variante (props effettive)
-- + miglior prezzo corrente tra tutti gli shop.
-- Utile per la pagina catalogo/listing.
-- ============================================================
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

COMMENT ON VIEW v_filament_full IS
    'Vista completa per il catalogo: filament + brand + tipo/variante con proprietà effettive + miglior prezzo attuale tra tutti gli shop.';

-- ============================================================
-- v_price_history_full
-- Storico prezzi completo con contesto filament+shop,
-- utile per i grafici di andamento prezzi.
-- ============================================================
CREATE OR REPLACE VIEW v_price_history_full AS
SELECT
    ph.id,
    ph.rilevato_at,
    ph.prezzo,
    ph.prezzo_spedizione,
    ph.sconto_percentuale,
    ph.prezzo_scontato,
    COALESCE(ph.prezzo_scontato, ph.prezzo)                         AS prezzo_finale,
    CASE
        WHEN f.peso_g > 0 THEN
            ROUND(
                (COALESCE(ph.prezzo_scontato, ph.prezzo) / f.peso_g * 1000)::NUMERIC,
                2
            )
    END                                                             AS prezzo_per_kg,
    ph.disponibile,
    -- Contesto
    fs.id   AS id_filament_shop,
    f.id    AS id_filament,
    f.peso_g,
    f.diametro_mm,
    f.colore,
    b.nome  AS brand,
    ft.nome AS tipo,
    fv.nome AS variante,
    s.id    AS id_shop,
    s.nome  AS shop
FROM price_history ph
JOIN filament_shop    fs ON fs.id  = ph.id_filament_shop
JOIN filament         f  ON f.id   = fs.id_filament
JOIN brand            b  ON b.id   = f.id_brand
JOIN filament_variant fv ON fv.id  = f.id_variant
JOIN filament_type    ft ON ft.id  = fv.id_type
JOIN shop             s  ON s.id   = fs.id_shop;

COMMENT ON VIEW v_price_history_full IS
    'Storico prezzi completo con contesto (brand, tipo, variante, shop). Usare con WHERE id_filament = X AND id_shop = Y per i grafici.';
