# Roadmap — Filament Finder

## Fase 1 — Fondamenta ✅ completata
- [x] Schema database PostgreSQL (con views, trigger, pg_trgm)
- [x] Views e dati seed (brand, tipi, varianti, shop, tag, stampanti)
- [x] Documentazione schema

## Fase 2 — Sito web ✅ completata
- [x] Setup progetto Next.js 15 (App Router, TypeScript, Tailwind v4, standalone)
- [x] Admin console (8 tab: Brand, Tipi, Varianti, Filamenti, Shop, Prezzi, Tag, Database)
- [x] Homepage con top filamenti €/kg + CTA catalogo
- [x] Catalogo con filtri client-side (tipo, brand, diametro, colore, €/kg, sorting)
- [x] Pagina dettaglio filamento (caratteristiche tecniche + grafico storico prezzi)
- [x] Confronto prezzi tra shop (best price highlight)
- [x] Logo e favicon (filament spool)
- [x] Deploy su VPS Hetzner — filamenti.offerteai.it — HTTPS

## Fase 3 — SEO ✅ completata
- [x] ISR Next.js (revalidate 900s su catalogo e dettaglio)
- [x] Sitemap dinamica (/sitemap.xml)
- [x] robots.txt
- [x] JSON-LD Product schema su pagina dettaglio
- [x] GitHub Actions CI/CD (push → deploy automatico)

## Fase 4 — Scraping automatico (prossima priorità)
- [ ] Scraper Amazon IT (Product Advertising API o Playwright)
- [ ] Scraper Prusa Shop
- [ ] Scraper Bambu Lab Store
- [ ] Scraper 3DJake / FilamentOne
- [ ] Scheduler rilevazione prezzi (ogni 6-12 ore via cron/systemd)
- [ ] Alert calo prezzo per utenti registrati (opzionale)

## Fase 5 — Crescita
- [ ] RSS feed offerte
- [ ] Link affiliati automatici (Amazon PA-API)
- [ ] Filtro compatibilità stampante
- [ ] Ricerca full-text (pg_trgm già configurato)
- [ ] Integrazione bot Telegram per notifiche prezzi
