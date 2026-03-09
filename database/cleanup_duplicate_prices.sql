-- ============================================================
-- CLEANUP: prezzi duplicati nella stessa finestra temporale
-- Mantiene solo il prezzo più basso per ogni (filament_shop, minuto)
-- Utile per riparare inserimenti multipli dello stesso scraper run
-- ============================================================
-- Eseguire su VPS: psql -U filament_app filament_finder -f cleanup_duplicate_prices.sql
-- oppure: sudo -u postgres psql filament_finder -f cleanup_duplicate_prices.sql

-- Prima: quanti duplicati esistono?
SELECT
    COUNT(*) AS totale_righe,
    COUNT(*) - COUNT(DISTINCT (id_filament_shop, DATE_TRUNC('minute', rilevato_at))) AS righe_duplicate
FROM price_history;

-- Elimina i duplicati, tenendo solo il prezzo più basso per (filament_shop, minuto)
WITH ranked AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY id_filament_shop, DATE_TRUNC('minute', rilevato_at)
            ORDER BY COALESCE(prezzo_scontato, prezzo) ASC, id ASC
        ) AS rn
    FROM price_history
)
DELETE FROM price_history
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Dopo: verifica
SELECT
    COUNT(*) AS totale_righe_dopo
FROM price_history;
