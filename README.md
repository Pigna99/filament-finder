# Filament Finder

Sito per la scelta e l'acquisto di filamenti per stampa 3D: confronto prezzi tra shop, storico prezzi, filtri avanzati e compatibilità con le stampanti più diffuse.

## Funzionalità pianificate

- **Catalogo** — filtri per tipo (PLA/PETG/TPU...), brand, colore, diametro, prezzo/kg
- **Confronto prezzi** — miglior prezzo attuale tra tutti gli shop monitorati
- **Storico prezzi** — grafico andamento prezzo nel tempo per shop
- **Compatibilità stampante** — quali filamenti sono adatti alla propria stampante
- **Admin console** — gestione catalogo, link acquisto, scraping manuale
- **Scraping automatico** — aggiornamento prezzi periodico da Amazon, Prusa, Bambu, 3DJake...

## Stack tecnologico

| Layer       | Tecnologia                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 15, Tailwind CSS          |
| Database    | PostgreSQL 15+                    |
| Scraping    | Python 3.11+, Playwright          |
| Deploy      | VPS Hetzner, PM2, GitHub Actions  |

## Struttura progetto

```
filament-finder/
├── docs/
│   ├── schema.md       ← Documentazione completa dello schema DB
│   └── roadmap.md      ← Piano di sviluppo
├── database/
│   ├── schema.sql      ← Schema principale (tabelle, indici, trigger)
│   ├── views.sql       ← Views per query frequenti
│   └── seed.sql        ← Dati iniziali (brand, tipi, varianti, tag, shop)
├── web/                ← Applicazione Next.js (TODO)
└── scraper/            ← Script Python scraping prezzi (TODO)
```

## Setup database

Richiede **PostgreSQL 15+**.

```bash
# Crea il database
psql -U postgres -c "CREATE DATABASE filament_finder;"

# Applica schema, views e dati iniziali
psql -U postgres -d filament_finder -f database/schema.sql
psql -U postgres -d filament_finder -f database/views.sql
psql -U postgres -d filament_finder -f database/seed.sql
```

## Architettura DB

Lo schema usa un pattern a tre livelli per le proprietà tecniche dei filamenti:

```
filament_type (PLA, PETG, TPU...)
    └── filament_variant (PLA Basic, PLA Matte, TPU 95A...)
            └── filament (Bambu PLA Matte Black 1kg 1.75mm)
```

Le proprietà tecniche (temperature, difficoltà stampa, ecc.) sono definite sul **tipo** e possono essere sovrascritte dalla **variante** tramite `COALESCE`. La view `v_filament_props` risolve automaticamente l'ereditarietà.

Vedi [docs/schema.md](docs/schema.md) per la documentazione completa.

## Viste principali

| View                   | Descrizione                                              |
|------------------------|----------------------------------------------------------|
| `v_filament_props`     | Proprietà tecniche effettive (con ereditarietà)          |
| `v_price_latest`       | Ultimo prezzo per ogni link, con €/kg calcolato          |
| `v_filament_full`      | Catalogo completo con miglior prezzo attuale             |
| `v_price_history_full` | Storico prezzi con contesto (per grafici)                |
