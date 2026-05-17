# filament-finder

Sito comparativo prezzi filamenti per stampa 3D. **Repo monorepo**: il web vive in `web/`.

- **Path VPS**: `/opt/filament-finder` (web in `web/`)
- **Process**: PM2 `filament-finder` (porta 3001)
- **Dominio**: `filamenti.offerteai.it`
- **Repo**: github.com/Pigna99/filament-finder
- **Struttura**: vedi [STRUCTURE.md](STRUCTURE.md)

## Stack

- Next.js 15 standalone, Tailwind v4
- **PostgreSQL 16** (npm `postgres`, non SQLite)
- `@tanstack/react-table` per le tabelle admin

## DB

- PostgreSQL locale sul VPS, db `filament_finder`, user `filament_app`
- `DATABASE_URL` vive in `web/ecosystem.config.js` **sul VPS** (non nel repo) e in `web/.env.local`
- Schema: `database/schema.sql` + migrations numerate in `database/migrations/`
- Views chiave: `v_filament_full` (catalogo), `v_price_latest` (prezzi correnti), `v_price_history_full` (grafico)

## Comandi

Tutto dentro `web/`:

```bash
cd web
npm run dev
npm run build       # SEMPRE prima del push
npm run lint
```

Migrations:
```bash
ssh pigna-bot 'cd /opt/filament-finder && psql -U filament_app -d filament_finder -f database/migrations/00X_*.sql'
```

## Admin

URL: `/admin?secret=FilamentAdmin2026` — 7 tab:
1. **Brand** — anagrafica produttori
2. **Tipi** — PLA, PETG, ASA, …
3. **Varianti** — Matte, Silk, Wood, …
4. **Filamenti** — combinazioni brand+tipo+variante+colore+peso
5. **Shop** — negozi tracciati
6. **Prezzi** — inserimento manuale prezzi
7. **Database** — raw SQL viewer

## Slug

`slugifyFilamento(brand, tipo, variante, colore, peso)` → `bambu-lab-pla-matte-black-1000g`. Definito in `web/src/lib/slugify.ts`.

## Scraper

`scripts/scraper.py` (Python, gira manualmente o via cron). Anche `fetch-amazon-guide-products.py` per i contenuti guide.

## Deploy

GitHub Actions su push `master` → SSH → `cd /opt/filament-finder/web` → `git pull` (root repo) + `npm ci` + `next build` + copia static + `pm2 restart ecosystem.config.js`.

## Gotcha

- **Password DB senza caratteri speciali** (`!`, `@`, ecc.) — escaping in PM2 rompe la connection string
- Dopo build: copiare `.env.local` anche in `.next/standalone/.env.local`, altrimenti runtime non vede `DATABASE_URL`
- Standalone: `cp -r .next/static .next/standalone/.next/static` + `cp -r public .next/standalone/public`
- Le migrations vanno applicate **manualmente** sul VPS — non c'è migration runner automatico
