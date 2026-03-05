-- ============================================================
-- FILAMENT FINDER — SCHEMA PRINCIPALE
-- PostgreSQL 15+
-- ============================================================

-- Estensione per ricerca testuale trigram (ILIKE veloce su nome/colore)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- BRAND
-- ============================================================
CREATE TABLE brand (
    id      SERIAL          PRIMARY KEY,
    nome    VARCHAR(100)    NOT NULL UNIQUE,
    url     TEXT,                           -- homepage ufficiale
    logo    TEXT,                           -- URL logo
    attivo  BOOLEAN         NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE  brand        IS 'Produttori di filamenti (Bambu, Prusament, eSUN...)';
COMMENT ON COLUMN brand.url    IS 'Sito ufficiale del brand';
COMMENT ON COLUMN brand.logo   IS 'URL immagine logo';

-- ============================================================
-- FILAMENT_TYPE  (materiale base: PLA, PETG, TPU...)
-- ============================================================
CREATE TABLE filament_type (
    id                  SERIAL          PRIMARY KEY,
    nome                VARCHAR(50)     NOT NULL UNIQUE,
    descrizione         TEXT,
    -- Proprietà tecniche base (ereditabili dalla variante)
    flessibile          BOOLEAN         NOT NULL DEFAULT FALSE,
    igroscopico         BOOLEAN         NOT NULL DEFAULT FALSE,
    difficolta_stampa   SMALLINT        CHECK (difficolta_stampa BETWEEN 1 AND 5),
    temp_stampa_min     SMALLINT,                               -- °C
    temp_stampa_max     SMALLINT,
    temp_piatto_min     SMALLINT,
    temp_piatto_max     SMALLINT,
    richiede_enclosure  BOOLEAN         NOT NULL DEFAULT FALSE,
    food_safe           BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Vincolo: min <= max dove entrambi presenti
    CONSTRAINT chk_temp_stampa  CHECK (temp_stampa_min  IS NULL OR temp_stampa_max  IS NULL OR temp_stampa_min  <= temp_stampa_max),
    CONSTRAINT chk_temp_piatto  CHECK (temp_piatto_min  IS NULL OR temp_piatto_max  IS NULL OR temp_piatto_min  <= temp_piatto_max)
);

COMMENT ON TABLE  filament_type                     IS 'Tipo di materiale base. Le proprietà sono valori di riferimento ereditati dalla variante via COALESCE.';
COMMENT ON COLUMN filament_type.difficolta_stampa   IS '1 = facile (PLA), 5 = difficile (PC, Nylon)';
COMMENT ON COLUMN filament_type.igroscopico         IS 'Il materiale assorbe umidità facilmente e richiede essiccatore';

-- ============================================================
-- FILAMENT_VARIANT  (es. PLA Basic, PLA Matte, TPU 95A...)
-- ============================================================
CREATE TABLE filament_variant (
    id                  SERIAL          PRIMARY KEY,
    id_type             INT             NOT NULL REFERENCES filament_type(id) ON DELETE RESTRICT,
    nome                VARCHAR(100)    NOT NULL,
    descrizione         TEXT,
    -- Proprietà che SOVRASCRIVONO il tipo base (NULL = eredita dal tipo)
    flessibile          BOOLEAN,
    igroscopico         BOOLEAN,
    difficolta_stampa   SMALLINT        CHECK (difficolta_stampa BETWEEN 1 AND 5),
    temp_stampa_min     SMALLINT,
    temp_stampa_max     SMALLINT,
    temp_piatto_min     SMALLINT,
    temp_piatto_max     SMALLINT,
    richiede_enclosure  BOOLEAN,
    food_safe           BOOLEAN,
    UNIQUE (id_type, nome),
    CONSTRAINT chk_var_temp_stampa  CHECK (temp_stampa_min IS NULL OR temp_stampa_max IS NULL OR temp_stampa_min <= temp_stampa_max),
    CONSTRAINT chk_var_temp_piatto  CHECK (temp_piatto_min IS NULL OR temp_piatto_max IS NULL OR temp_piatto_min <= temp_piatto_max)
);

COMMENT ON TABLE  filament_variant              IS 'Variante specifica di un tipo: PLA Matte, TPU 95A, PETG HF... Le proprietà non NULL sovrascrivono il tipo base.';
COMMENT ON COLUMN filament_variant.nome         IS 'Es: Basic, Matte, Silk, HS (High Speed), 95A, Galaxy...';

-- ============================================================
-- FILAMENT  (prodotto specifico acquistabile)
-- ============================================================
CREATE TABLE filament (
    id                  SERIAL          PRIMARY KEY,
    id_variant          INT             NOT NULL REFERENCES filament_variant(id) ON DELETE RESTRICT,
    id_brand            INT             NOT NULL REFERENCES brand(id) ON DELETE RESTRICT,
    -- Identificazione prodotto
    sku                 VARCHAR(100),                           -- codice prodotto brand
    peso_g              SMALLINT        NOT NULL CHECK (peso_g > 0),    -- grammi (250, 500, 1000, 2000)
    diametro_mm         NUMERIC(4,2)    NOT NULL CHECK (diametro_mm IN (1.75, 2.85)),
    -- Colore
    colore              VARCHAR(100),                           -- nome commerciale (es. "Galaxy Black")
    colore_hex          CHAR(7)         CHECK (colore_hex ~ '^#[0-9A-Fa-f]{6}$'),
    colore_famiglia     VARCHAR(50),                            -- bianco|nero|grigio|rosso|blu|verde|giallo|arancio|viola|trasparente|multicolor
    -- Link
    link_immagine       TEXT,
    link_brand          TEXT,                                   -- pagina prodotto sul sito ufficiale brand
    -- Proprietà fisiche
    densita_g_cm3       NUMERIC(5,3),                          -- g/cm³ (utile per calcolo peso stampa)
    humidity_sensitive  BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Valutazione aggregata (aggiornata via scraping recensioni)
    rating_medio        NUMERIC(3,2)    CHECK (rating_medio BETWEEN 0 AND 5),
    num_recensioni      INT             DEFAULT 0,
    -- Stato
    attivo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  filament                  IS 'Prodotto fisico acquistabile: combinazione unica di variante + brand + peso + diametro + colore.';
COMMENT ON COLUMN filament.sku              IS 'Codice prodotto del brand (utile per scraping e matching)';
COMMENT ON COLUMN filament.colore_famiglia  IS 'Raggruppamento cromatico per filtri UI';
COMMENT ON COLUMN filament.densita_g_cm3   IS 'Densità in g/cm³, utile per stimare il peso di una stampa dal volume del modello';

-- ============================================================
-- TAG  (caratteristiche speciali aggiuntive)
-- ============================================================
CREATE TABLE tag (
    id          SERIAL          PRIMARY KEY,
    nome        VARCHAR(100)    NOT NULL UNIQUE,
    descrizione TEXT
);

COMMENT ON TABLE tag IS 'Proprietà speciali non modellabili nel tipo/variante: conduttivo, UV-resistant, glow-in-dark, carbon-fiber, ecc.';

-- ============================================================
-- FILAMENT <-> TAG  (many-to-many)
-- ============================================================
CREATE TABLE filament_tag (
    id_filament INT NOT NULL REFERENCES filament(id) ON DELETE CASCADE,
    id_tag      INT NOT NULL REFERENCES tag(id)      ON DELETE CASCADE,
    PRIMARY KEY (id_filament, id_tag)
);

-- ============================================================
-- PRINTER_PROFILE  (modelli di stampante comuni)
-- ============================================================
CREATE TABLE printer_profile (
    id              SERIAL          PRIMARY KEY,
    nome            VARCHAR(100)    NOT NULL,
    brand           VARCHAR(100),
    diametro_mm     NUMERIC(4,2)    NOT NULL CHECK (diametro_mm IN (1.75, 2.85)),
    ha_enclosure    BOOLEAN         NOT NULL DEFAULT FALSE,
    max_temp_hotend SMALLINT,
    max_temp_piatto SMALLINT,
    attivo          BOOLEAN         NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE  printer_profile              IS 'Profili stampante per il filtro compatibilità filamenti';
COMMENT ON COLUMN printer_profile.ha_enclosure IS 'Presenza di enclosure (necessaria per ABS, ASA, PC, Nylon)';

-- ============================================================
-- FILAMENT_VARIANT <-> PRINTER_PROFILE  (compatibilità)
-- ============================================================
CREATE TABLE filament_variant_printer (
    id_variant      INT     NOT NULL REFERENCES filament_variant(id) ON DELETE CASCADE,
    id_printer      INT     NOT NULL REFERENCES printer_profile(id)  ON DELETE CASCADE,
    compatibile     BOOLEAN NOT NULL DEFAULT TRUE,
    note            TEXT,                                       -- es. "Richiede DryBox, consigliato 0.4mm nozzle"
    PRIMARY KEY (id_variant, id_printer)
);

COMMENT ON TABLE  filament_variant_printer.compatibile IS 'FALSE = esplicitamente incompatibile (es. ABS su stampante senza enclosure)';

-- ============================================================
-- SHOP  (negozi online)
-- ============================================================
CREATE TABLE shop (
    id              SERIAL          PRIMARY KEY,
    nome            VARCHAR(100)    NOT NULL,
    url             TEXT,                                       -- homepage
    paese           CHAR(2),                                   -- ISO 3166-1 alpha-2 (IT, DE, US...)
    tipo            VARCHAR(50),                               -- marketplace | diretto | reseller
    codice_sconto   VARCHAR(50),                               -- coupon affiliato fisso per tutto il shop
    attivo          BOOLEAN         NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE  shop.tipo           IS 'marketplace = Amazon/eBay, diretto = Bambu/Prusa, reseller = Filament2Print/3DJake';
COMMENT ON COLUMN shop.codice_sconto  IS 'Coupon affiliato valido per tutto il negozio';

-- ============================================================
-- FILAMENT <-> SHOP  (link di acquisto)
-- ============================================================
CREATE TABLE filament_shop (
    id              SERIAL          PRIMARY KEY,
    id_filament     INT             NOT NULL REFERENCES filament(id) ON DELETE CASCADE,
    id_shop         INT             NOT NULL REFERENCES shop(id)     ON DELETE CASCADE,
    link            TEXT            NOT NULL,
    affiliazione    BOOLEAN         NOT NULL DEFAULT FALSE,
    codice_sconto   VARCHAR(50),                               -- coupon specifico per questo prodotto
    attivo          BOOLEAN         NOT NULL DEFAULT TRUE,     -- FALSE se link morto o prodotto non disponibile
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (id_filament, id_shop)
);

COMMENT ON TABLE  filament_shop                IS 'Collegamento filamento → negozio con URL di acquisto e info affiliazione';
COMMENT ON COLUMN filament_shop.codice_sconto  IS 'Coupon specifico per questo prodotto (ha priorità sul coupon globale dello shop)';
COMMENT ON COLUMN filament_shop.attivo         IS 'Mettere a FALSE quando il link è morto o il prodotto è discontinuato';

-- ============================================================
-- PRICE_HISTORY  (storico prezzi per link acquisto)
-- NOTA: prezzo_per_kg è calcolato nella view v_price_latest
-- ============================================================
CREATE TABLE price_history (
    id                  SERIAL          PRIMARY KEY,
    id_filament_shop    INT             NOT NULL REFERENCES filament_shop(id) ON DELETE CASCADE,
    prezzo              NUMERIC(8,2)    NOT NULL CHECK (prezzo >= 0),
    prezzo_spedizione   NUMERIC(8,2)    NOT NULL DEFAULT 0 CHECK (prezzo_spedizione >= 0),
    sconto_percentuale  NUMERIC(5,2)    CHECK (sconto_percentuale BETWEEN 0 AND 100),
    prezzo_scontato     NUMERIC(8,2)    CHECK (prezzo_scontato >= 0),
    -- prezzo_per_kg NON è GENERATED (PostgreSQL non supporta subquery in generated columns)
    -- → calcolato in realtime dalla view v_price_latest
    disponibile         BOOLEAN         NOT NULL DEFAULT TRUE,
    rilevato_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  price_history                     IS 'Storico rilevazioni prezzi. prezzo_per_kg è disponibile nella view v_price_latest.';
COMMENT ON COLUMN price_history.prezzo_scontato     IS 'Prezzo finale dopo applicazione sconto. Se NULL, il prezzo finale è "prezzo".';
COMMENT ON COLUMN price_history.sconto_percentuale  IS 'Percentuale di sconto rilevata sul sito (può essere NULL anche se c''è un prezzo_scontato diverso)';

-- ============================================================
-- INDICI
-- ============================================================

-- filament
CREATE INDEX idx_filament_variant       ON filament(id_variant);
CREATE INDEX idx_filament_brand         ON filament(id_brand);
CREATE INDEX idx_filament_diametro      ON filament(diametro_mm);
CREATE INDEX idx_filament_colore_fam    ON filament(colore_famiglia);
CREATE INDEX idx_filament_attivo        ON filament(attivo) WHERE attivo = TRUE;

-- ricerca testuale su nome colore
CREATE INDEX idx_filament_colore_trgm   ON filament USING gin(colore gin_trgm_ops);

-- filament_shop
CREATE INDEX idx_filament_shop_fil      ON filament_shop(id_filament);
CREATE INDEX idx_filament_shop_shop     ON filament_shop(id_shop);
CREATE INDEX idx_filament_shop_attivo   ON filament_shop(attivo) WHERE attivo = TRUE;

-- price_history (ottimizzato per "ultimo prezzo per link")
CREATE INDEX idx_price_history_fs       ON price_history(id_filament_shop);
CREATE INDEX idx_price_history_time     ON price_history(id_filament_shop, rilevato_at DESC);

-- ============================================================
-- TRIGGER: updated_at automatico su filament
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_filament_updated_at
    BEFORE UPDATE ON filament
    FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
