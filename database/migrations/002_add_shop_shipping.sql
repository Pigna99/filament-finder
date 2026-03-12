-- Regole di spedizione per shop
-- costo: costo fisso in EUR; soglia_gratis: importo sopra cui la spedizione è gratuita
CREATE TABLE IF NOT EXISTS shop_shipping (
    id              SERIAL          PRIMARY KEY,
    id_shop         INT             NOT NULL REFERENCES shop(id) ON DELETE CASCADE UNIQUE,
    costo           NUMERIC(8,2)    NOT NULL DEFAULT 0,
    soglia_gratis   NUMERIC(8,2),          -- NULL = mai gratuita
    corriere        VARCHAR(100),
    giorni_min      INT,
    giorni_max      INT,
    note            TEXT
);
