# Struttura — filament-finder

Sito confronto prezzi filamenti 3D. Dominio: `filamenti.offerteai.it`.
Stack: Next.js 15 + PostgreSQL 16. Repo monorepo: il web vive in `web/`.
Aggiornare quando si modifica la struttura (vedi CLAUDE.md root).

```
filament-finder/
├── web/                       # ← progetto Next.js vero e proprio
│   ├── src/
│   │   ├── app/               # App Router
│   │   │   ├── admin/         # admin 7 tab: Brand/Tipi/Varianti/Filamenti/Shop/Prezzi/DB
│   │   │   ├── api/           # route handlers
│   │   │   ├── brand/         # listing per brand
│   │   │   ├── tipo/          # listing per tipo (PLA, PETG, …)
│   │   │   ├── catalogo/      # catalogo completo
│   │   │   ├── confronta/     # confronto multi-filamento
│   │   │   ├── filamento/     # pagina singolo filamento
│   │   │   ├── guide/         # contenuti SEO/guide
│   │   │   ├── offerte/       # offerte attive
│   │   │   ├── layout.tsx / page.tsx / sitemap.ts / robots.ts
│   │   │   └── not-found.tsx
│   │   ├── components/        # React components
│   │   └── lib/               # db.ts (postgres pkg), compare.ts, filamenti.ts, guide.ts, slugify.ts
│   ├── public/
│   ├── next.config.ts
│   ├── ecosystem.config.js    # PM2 (porta 3001) — DATABASE_URL solo sul VPS
│   └── package.json
├── database/
│   ├── schema.sql             # schema iniziale
│   ├── seed.sql / seed/       # dati iniziali
│   ├── views.sql              # v_filament_full, v_price_latest, v_price_history_full
│   ├── migrations/            # 001_add_is_refill.sql, 002_add_shop_shipping.sql, …
│   └── cleanup_duplicate_prices.sql
├── scripts/
│   ├── scraper.py             # scraper prezzi
│   ├── fetch-amazon-guide-products.py
│   └── explore_impact_promos.py
├── docs/
├── .github/workflows/         # deploy GHA su push master
└── README.md
```

## DB

PostgreSQL 16 locale sul VPS, db `filament_finder`, user `filament_app`.
`DATABASE_URL` vive in `web/ecosystem.config.js` sul VPS e in `web/.env.local` (NON in git).
Dopo ogni build copiare `.env.local` anche in `.next/standalone/.env.local`.

## Note

- npm package `postgres` (non SQLite)
- Admin secret: `?secret=FilamentAdmin2026`
- Password DB senza caratteri speciali per evitare escaping in PM2
- Slug: `slugifyFilamento(brand, tipo, variante, colore, peso)` → `bambu-lab-pla-matte-black-1000g`
