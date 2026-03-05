# Schema Database — Filament Finder

## Panoramica

Il database è PostgreSQL 15+. Modella il catalogo filamenti per stampa 3D con storico prezzi e compatibilità stampanti.

---

## Architettura: ereditarietà tipo → variante → filamento

Il sistema usa un pattern a tre livelli per le proprietà tecniche:

```
filament_type (materiale base: PLA, PETG, ABS...)
    └── filament_variant (variante: PLA Matte, TPU 95A...)
            └── filament (prodotto: Bambu PLA Matte Black 1kg 1.75mm)
```

Le proprietà tecniche (temperature, difficoltà, ecc.) vivono sul **tipo**, ma la **variante** può sovrascriverle con valori NULL-safe tramite `COALESCE`.
Per leggere le proprietà effettive di una variante usare sempre la view `v_filament_props`.

---

## Tabelle

### `brand`

| Colonna | Tipo         | Note                    |
|---------|--------------|-------------------------|
| id      | SERIAL PK    |                         |
| nome    | VARCHAR(100) | UNIQUE                  |
| url     | TEXT         | Homepage ufficiale      |
| logo    | TEXT         | URL immagine logo       |
| attivo  | BOOLEAN      | Default TRUE            |

---

### `filament_type`

Materiale base. Le proprietà tecniche sono **valori di riferimento** per il tipo.

| Colonna             | Tipo        | Note                                   |
|---------------------|-------------|----------------------------------------|
| id                  | SERIAL PK   |                                        |
| nome                | VARCHAR(50) | UNIQUE — PLA, PETG, ABS, TPU...        |
| descrizione         | TEXT        |                                        |
| flessibile          | BOOLEAN     | Default FALSE                          |
| igroscopico         | BOOLEAN     | Assorbe umidità → richiede essiccatore |
| difficolta_stampa   | SMALLINT    | 1 (facile) — 5 (difficile)             |
| temp_stampa_min/max | SMALLINT    | °C, con vincolo min ≤ max              |
| temp_piatto_min/max | SMALLINT    | °C, con vincolo min ≤ max              |
| richiede_enclosure  | BOOLEAN     | Default FALSE                          |
| food_safe           | BOOLEAN     | Default FALSE                          |

---

### `filament_variant`

Variante specifica di un tipo. I campi tecnici con valore `NULL` ereditano dal tipo base.

| Colonna           | Tipo        | Note                                          |
|-------------------|-------------|-----------------------------------------------|
| id                | SERIAL PK   |                                               |
| id_type           | INT FK      | → filament_type                               |
| nome              | VARCHAR(100)| Es: Basic, Matte, Silk, 95A, HS               |
| descrizione       | TEXT        |                                               |
| *[tutti i campi tecnici]* | | NULL = eredita dal tipo via COALESCE  |
| UNIQUE            |             | (id_type, nome)                               |

**Esempio ereditarietà:**
`TPU` ha `flessibile = TRUE`. `TPU 95A` ha `flessibile = NULL` → eredita TRUE.
`TPU 95A` ha `temp_stampa_min = 220` → sovrascrive il valore base del tipo TPU.

---

### `filament`

Prodotto fisico acquistabile. Combinazione unica di variante + brand + peso + diametro + colore.

| Colonna          | Tipo           | Note                                              |
|------------------|----------------|---------------------------------------------------|
| id               | SERIAL PK      |                                                   |
| id_variant       | INT FK         | → filament_variant                                |
| id_brand         | INT FK         | → brand                                           |
| sku              | VARCHAR(100)   | Codice prodotto del brand                         |
| peso_g           | SMALLINT       | CHECK > 0 — 250, 500, 1000, 2000                  |
| diametro_mm      | NUMERIC(4,2)   | CHECK IN (1.75, 2.85)                             |
| colore           | VARCHAR(100)   | Nome commerciale (es. "Galaxy Black")             |
| colore_hex       | CHAR(7)        | CHECK regex `#RRGGBB`                             |
| colore_famiglia  | VARCHAR(50)    | bianco / nero / grigio / rosso / blu / ...        |
| link_immagine    | TEXT           |                                                   |
| link_brand       | TEXT           | Pagina prodotto sul sito ufficiale                |
| densita_g_cm3    | NUMERIC(5,3)   | Per calcolo peso stampa da volume modello         |
| humidity_sensitive | BOOLEAN      | Default FALSE                                     |
| rating_medio     | NUMERIC(3,2)   | 0–5, aggiornato via scraping                      |
| num_recensioni   | INT            | Default 0                                         |
| attivo           | BOOLEAN        | Default TRUE — FALSE se discontinuato             |

---

### `tag` e `filament_tag`

Caratteristiche speciali non modellabili nel tipo/variante.

**Esempi tag:** `conduttivo`, `UV-resistant`, `glow-in-dark`, `color-change-temp`, `fibra-carbonio`, `riciclato`, `refill`, `alta-velocita`, `nozzle-indurito`

Relazione many-to-many tramite `filament_tag(id_filament, id_tag)`.

---

### `printer_profile`

Profili stampante per il filtro di compatibilità.

| Colonna         | Tipo          | Note                                |
|-----------------|---------------|-------------------------------------|
| id              | SERIAL PK     |                                     |
| nome            | VARCHAR(100)  | Es: "Bambu X1C", "Prusa MK4"        |
| brand           | VARCHAR(100)  |                                     |
| diametro_mm     | NUMERIC(4,2)  | CHECK IN (1.75, 2.85)               |
| ha_enclosure    | BOOLEAN       | Necessaria per ABS, ASA, PC, Nylon  |
| max_temp_hotend | SMALLINT      | °C                                  |
| max_temp_piatto | SMALLINT      | °C                                  |

---

### `filament_variant_printer`

Compatibilità tra variante filamento e modello stampante.

| Colonna     | Note                                    |
|-------------|------------------------------------------|
| id_variant  | FK → filament_variant                    |
| id_printer  | FK → printer_profile                     |
| compatibile | FALSE = esplicitamente incompatibile     |
| note        | Es: "Richiede DryBox, nozzle 0.4mm in acciaio" |

PK composta: `(id_variant, id_printer)`.

---

### `shop`

| Colonna       | Tipo        | Note                                          |
|---------------|-------------|-----------------------------------------------|
| id            | SERIAL PK   |                                               |
| nome          | VARCHAR(100)|                                               |
| url           | TEXT        | Homepage                                      |
| paese         | CHAR(2)     | ISO 3166-1 alpha-2 (IT, DE, US...)            |
| tipo          | VARCHAR(50) | marketplace / diretto / reseller              |
| codice_sconto | VARCHAR(50) | Coupon affiliato valido per tutto lo shop     |
| attivo        | BOOLEAN     | Default TRUE                                  |

---

### `filament_shop`

Link di acquisto tra un filamento e un negozio.

| Colonna       | Tipo       | Note                                              |
|---------------|------------|---------------------------------------------------|
| id            | SERIAL PK  |                                                   |
| id_filament   | INT FK     | → filament                                        |
| id_shop       | INT FK     | → shop                                            |
| link          | TEXT       | URL diretto al prodotto                           |
| affiliazione  | BOOLEAN    | Default FALSE                                     |
| codice_sconto | VARCHAR(50)| Coupon specifico prodotto (priorità su shop)      |
| attivo        | BOOLEAN    | FALSE se link morto o prodotto non disponibile    |
| UNIQUE        |            | (id_filament, id_shop)                            |

---

### `price_history`

Ogni riga = una rilevazione prezzo per un dato link di acquisto.

| Colonna             | Tipo          | Note                                              |
|---------------------|---------------|---------------------------------------------------|
| id                  | SERIAL PK     |                                                   |
| id_filament_shop    | INT FK        | → filament_shop                                   |
| prezzo              | NUMERIC(8,2)  | Prezzo base, CHECK ≥ 0                            |
| prezzo_spedizione   | NUMERIC(8,2)  | Default 0                                         |
| sconto_percentuale  | NUMERIC(5,2)  | 0–100, può essere NULL                            |
| prezzo_scontato     | NUMERIC(8,2)  | Prezzo dopo sconto (NULL se non scontato)         |
| disponibile         | BOOLEAN       | Default TRUE                                      |
| rilevato_at         | TIMESTAMPTZ   | Default NOW()                                     |

> **Nota:** `prezzo_per_kg` **non è** una GENERATED column (PostgreSQL non supporta subquery nelle generated columns). È calcolato nelle view `v_price_latest` e `v_price_history_full`.

---

## Views

### `v_filament_props`

Proprietà tecniche effettive per variante, usando `COALESCE(variante.prop, tipo.prop)`.

```sql
-- Uso tipico
SELECT * FROM v_filament_props WHERE tipo = 'PLA';
SELECT * FROM v_filament_props WHERE id_variant = 5;
```

---

### `v_price_latest`

Ultimo prezzo rilevato per ogni `filament_shop` attivo, con `prezzo_finale`, `prezzo_totale` e `prezzo_per_kg` calcolati.
Usa `LATERAL` per prendere l'ultima riga di `price_history` per ogni link.

```sql
-- Prezzo più basso attuale per un filamento su tutti gli shop
SELECT shop_id, shop, prezzo_finale, prezzo_per_kg
FROM v_price_latest
WHERE id_filament = 42 AND disponibile = TRUE
ORDER BY prezzo_finale;
```

---

### `v_filament_full`

Vista completa per il catalogo: filament + brand + tipo/variante + miglior prezzo.

```sql
-- Listing catalogo con filtri
SELECT id, brand, tipo, variante, colore, peso_g, prezzo_min, prezzo_per_kg_min
FROM v_filament_full
WHERE tipo = 'PLA' AND diametro_mm = 1.75
ORDER BY prezzo_per_kg_min;
```

---

### `v_price_history_full`

Storico prezzi completo con contesto. Usare per i grafici di andamento.

```sql
-- Storico prezzi su Amazon IT per un filamento specifico
SELECT rilevato_at, prezzo_finale, prezzo_per_kg
FROM v_price_history_full
WHERE id_filament = 42 AND id_shop = 1
ORDER BY rilevato_at;
```

---

## Indici principali

| Indice                    | Colonna                                | Scopo                              |
|---------------------------|----------------------------------------|------------------------------------|
| `idx_filament_variant`    | `filament(id_variant)`                 | JOIN variante                      |
| `idx_filament_brand`      | `filament(id_brand)`                   | JOIN brand                         |
| `idx_filament_diametro`   | `filament(diametro_mm)`                | Filtro diametro                    |
| `idx_filament_colore_fam` | `filament(colore_famiglia)`            | Filtro colore                      |
| `idx_filament_attivo`     | `filament(attivo) WHERE attivo=TRUE`   | Partial index, solo attivi         |
| `idx_filament_colore_trgm`| GIN trigram su `colore`               | Ricerca testo sul colore           |
| `idx_price_history_time`  | `price_history(id_filament_shop, rilevato_at DESC)` | Ultimo prezzo per link |

---

## Setup

```bash
# Crea il database
psql -U postgres -c "CREATE DATABASE filament_finder;"

# Applica schema → views → dati iniziali
psql -U postgres -d filament_finder -f database/schema.sql
psql -U postgres -d filament_finder -f database/views.sql
psql -U postgres -d filament_finder -f database/seed.sql
```

---

## Diagramma ER (testuale)

```
brand ──────────────────────── filament ──── filament_tag ──── tag
                                   │
filament_type ── filament_variant ─┘
                       │
               filament_variant_printer ── printer_profile

filament ── filament_shop ── shop
                │
           price_history
```
