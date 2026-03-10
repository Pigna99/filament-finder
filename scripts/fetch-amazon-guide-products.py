#!/usr/bin/env python3
"""
Genera il codice TypeScript per prodottiConsigliati in guide.ts
usando i dati già presenti nel database di Filament Finder.

Esecuzione sul VPS:
  cd /opt/filament-finder/scripts
  python3 fetch-amazon-guide-products.py >> output.ts
  # Poi copia i blocchi prodottiConsigliati in web/src/lib/guide.ts
"""

import sys
import psycopg2
from psycopg2.extras import RealDictCursor

DB_URL = "postgresql://filament_app:ff_SecurePass2026@127.0.0.1/filament_finder"

# Tipo guida → tipo DB + varianti preferite (ordine priorità)
GUIDE_CONFIG = {
    "pla": {
        "tipo": "PLA",
        "titolo_sezione": "Filamenti PLA consigliati",
        "varianti_prefer": ["Matte", "Basic", "Plus", "Silk"],
        "n": 4,
    },
    "petg": {
        "tipo": "PETG",
        "titolo_sezione": "Filamenti PETG consigliati",
        "varianti_prefer": ["Basic", "HF", "Transparent"],
        "n": 4,
    },
    "abs-asa": {
        "tipo": "ASA",  # preferisci ASA, poi ABS
        "tipo_alt": "ABS",
        "titolo_sezione": "Filamenti ABS/ASA consigliati",
        "varianti_prefer": ["Standard"],
        "n": 4,
    },
    "tpu": {
        "tipo": "TPU",
        "titolo_sezione": "Filamenti TPU consigliati",
        "varianti_prefer": ["95A", "90A"],
        "n": 4,
    },
    "nylon-pa": {
        "tipo": "NYLON",
        "titolo_sezione": "Filamenti Nylon consigliati",
        "varianti_prefer": ["PA12", "PA6"],
        "n": 3,
    },
    "pla-cf": {
        "tipo": "PLA-CF",
        "titolo_sezione": "Filamenti in fibra di carbonio consigliati",
        "varianti_prefer": ["Standard"],
        "n": 3,
    },
}

BRAND_PRIORITY = ["Bambu Lab", "Polymaker", "eSUN", "SUNLU", "Elegoo", "3DJake"]


def get_products(cur, tipo: str, n: int, tipo_alt: str | None = None):
    """Restituisce i migliori N prodotti per tipo, con immagine e link shop."""
    tipi = [tipo]
    if tipo_alt:
        tipi.append(tipo_alt)

    cur.execute("""
        SELECT
            v.id,
            v.brand,
            v.tipo,
            v.variante,
            v.colore,
            v.link_immagine,
            v.peso_g,
            v.diametro_mm,
            v.prezzo_min,
            (
                SELECT vpl.link
                FROM v_price_latest vpl
                WHERE vpl.id_filament = v.id AND vpl.disponibile = TRUE
                ORDER BY vpl.prezzo_finale ASC
                LIMIT 1
            ) AS shop_link,
            (
                SELECT s.nome
                FROM v_price_latest vpl
                JOIN shop s ON s.id = vpl.id_shop
                WHERE vpl.id_filament = v.id AND vpl.disponibile = TRUE
                ORDER BY vpl.prezzo_finale ASC
                LIMIT 1
            ) AS shop_nome
        FROM v_filament_full v
        WHERE v.tipo = ANY(%s)
          AND v.link_immagine IS NOT NULL
          AND v.diametro_mm = 1.75
          AND v.peso_g = 1000
          AND v.prezzo_min IS NOT NULL
        ORDER BY v.prezzo_min ASC
        LIMIT 30
    """, (tipi,))

    rows = cur.fetchall()

    # Deduplica per brand: max 1 prodotto per brand
    seen_brands = {}
    for row in rows:
        brand = row["brand"]
        if brand not in seen_brands:
            seen_brands[brand] = row

    # Ordina per priorità brand poi prezzo
    def brand_rank(row):
        try:
            return BRAND_PRIORITY.index(row["brand"])
        except ValueError:
            return len(BRAND_PRIORITY)

    unique = sorted(seen_brands.values(), key=lambda r: (brand_rank(r), r["prezzo_min"] or 9999))
    return unique[:n]


def escape_ts(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")


def format_product(row: dict, badge: str | None = None) -> str:
    brand    = row["brand"]
    tipo     = row["tipo"]
    variante = row["variante"]
    colore   = row["colore"] or "Black"
    peso     = row["peso_g"]
    prezzo   = row["prezzo_min"]
    shop     = row["shop_nome"] or ""
    link     = row["shop_link"] or ""
    image    = row["link_immagine"] or ""

    nome_completo = f"{brand} {tipo} {variante} {colore} {peso}g"
    nome_breve    = f"{brand} {tipo} {variante}"[:24]
    descrizione   = (
        f"{brand} {tipo} {variante} — {colore}, {peso}g. "
        f"Disponibile su {shop}"
        + (f" a €{prezzo:.2f}" if prezzo else "")
        + "."
    )

    badge_line = f'\n        badge: "{escape_ts(badge)}",' if badge else ""

    return f"""      {{
        nome: "{escape_ts(nome_completo)}",
        nomeBrevissimo: "{escape_ts(nome_breve)}",
        descrizione: "{escape_ts(descrizione)}",{badge_line}
        imageUrl: "{escape_ts(image)}",
        affiliateLink: "{escape_ts(link)}",
      }}"""


def main():
    try:
        conn = psycopg2.connect(DB_URL)
    except Exception as e:
        print(f"Errore connessione DB: {e}", file=sys.stderr)
        sys.exit(1)

    cur = conn.cursor(cursor_factory=RealDictCursor)
    print("// ── OUTPUT GENERATO DA fetch-amazon-guide-products.py ──────────────────")
    print("// Copia i blocchi prodottiConsigliati in web/src/lib/guide.ts\n")

    for slug, cfg in GUIDE_CONFIG.items():
        tipo     = cfg["tipo"]
        tipo_alt = cfg.get("tipo_alt")
        n        = cfg["n"]
        titolo   = cfg["titolo_sezione"]

        print(f"\n// ── {slug} ({tipo}) ──────────────────────────────────────────────────")
        rows = get_products(cur, tipo, n, tipo_alt)

        if not rows:
            print(f"    // ATTENZIONE: nessun prodotto trovato per {tipo}")
            continue

        print(f"    // Titolo sezione: \"{titolo}\"")
        print(f"    prodottiConsigliati: [")

        badges = ["Best Value", "Qualità", "Versatile", "Premium"]
        for i, row in enumerate(rows):
            badge = badges[i] if i < len(badges) else None
            comma = "," if i < len(rows) - 1 else ""
            print(format_product(row, badge) + comma)

        print("    ],")

    cur.close()
    conn.close()
    print("\n// ── FINE OUTPUT ─────────────────────────────────────────────────────────")
    print("// Ricorda di rivedere nomi e descrizioni manualmente!", file=sys.stderr)


if __name__ == "__main__":
    main()
