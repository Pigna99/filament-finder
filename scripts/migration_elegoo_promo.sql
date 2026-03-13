-- Migration: tabella elegoo_promo per offerte/coupon/banner Impact
-- Eseguire sul VPS: psql -U filament_app -d filament_finder -f scripts/migration_elegoo_promo.sql

CREATE TABLE IF NOT EXISTS elegoo_promo (
  id              TEXT PRIMARY KEY,          -- Impact Deal/Ad ID
  tipo            TEXT NOT NULL,             -- 'deal' | 'banner'
  nome            TEXT,
  descrizione     TEXT,
  codice          TEXT,                      -- promo code (null se non c'è)
  sconto_tipo     TEXT,                      -- PERCENT | FIXED | null
  sconto_valore   NUMERIC(10,2),             -- es. 5.00 oppure 10.00
  sconto_valuta   TEXT,                      -- EUR, USD, null per %
  scope           TEXT,                      -- ENTIRE_STORE | PRODUCT | null
  prodotti        JSONB,                     -- [{ProductName, ...}]
  banner_url      TEXT,                      -- URL immagine banner
  tracking_link   TEXT,                      -- link affiliato con tracking
  larghezza       INT,
  altezza         INT,
  data_inizio     TIMESTAMPTZ,
  data_fine       TIMESTAMPTZ,
  attivo          BOOLEAN NOT NULL DEFAULT TRUE,
  aggiornato_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elegoo_promo_attivo ON elegoo_promo (attivo);
CREATE INDEX IF NOT EXISTS idx_elegoo_promo_tipo   ON elegoo_promo (tipo);

COMMENT ON TABLE elegoo_promo IS 'Offerte, coupon e banner Elegoo da Impact API';
