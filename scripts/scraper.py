#!/usr/bin/env python3
"""
Filament Finder — Scraper prezzi
Supporta: Elegoo (Shopify), SUNLU IT (Shopify), eSUN EU (HTML+JS), Bambu Lab EU (sitemap+HTML), 3DJake IT (sitemap+JSON-LD)

Uso:
  python scraper.py                    # scrapa tutti gli shop
  python scraper.py --shop elegoo      # solo Elegoo
  python scraper.py --shop sunlu       # solo SUNLU
  python scraper.py --shop esun        # solo eSUN EU
  python scraper.py --shop bambu       # solo Bambu Lab
  python scraper.py --shop 3djake      # solo 3DJake IT
  python scraper.py --dry-run          # mostra cosa farebbe senza scrivere
"""

import re
import json
import time
import random
import logging
import argparse
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Optional
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import RealDictCursor

# ── Configurazione ────────────────────────────────────────────────────────────

DB_URL = "postgresql://filament_app:ff_SecurePass2026@127.0.0.1/filament_finder"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json,text/html,*/*",
    "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scraper")

# ── Tabelle di riconoscimento ─────────────────────────────────────────────────

# Ordine importante: tipi più specifici prima
TYPE_MAP = [
    ("PLA-CF",  ["pla-cf", "pla cf", "pla carbon fiber", "carbon fiber pla"]),
    ("PETG-CF", ["petg-cf", "petg cf", "petg carbon"]),
    ("PA-CF",   ["pa-cf", "pa cf", "nylon cf", "nylon carbon"]),
    ("ASA",     ["asa"]),
    ("ABS",     ["abs+", " abs ", "abs-", "-abs"]),
    ("PETG",    ["petg", "pet-g"]),
    ("TPU",     ["tpu", "flexible filament", "elastico", "flessibile"]),
    ("NYLON",   ["nylon", "polyamide", "pa6", "pa12", "pa11", "pa 6", "pa 12"]),
    ("PC",      ["polycarbonate", "policarbonato", " pc filament", "pc filamento", " pc ", "pc+"]),
    ("HIPS",    ["hips"]),
    ("PVA",     ["pva"]),
    ("PLA",     ["pla"]),  # ultimo: molti nomi iniziano con PLA
]

# Variante per tipo
VARIANT_MAP = {
    "PLA": [
        ("Matte",       ["matte", "mat ", "opaco", "opaca"]),
        ("Silk",        ["silk", "seta", "glossy", "lucido"]),
        ("Galaxy",      ["galaxy", "starlight", "glitter", "galassia", "luminoso", "sparkle"]),
        ("Marble",      ["marble", "marmo", "stone", "pietra"]),
        ("HS",          ["high speed", " hs ", "rapid pla", "r-pla", "rapido"]),
        ("Plus",        ["pla+", "pla plus", "pla pro", "pla neo"]),
        ("Basic",       []),  # fallback
    ],
    "PETG": [
        ("HF",          ["hf ", "high flow"]),
        ("Transparent", ["transparent", "trasparente", "clear", "crystal"]),
        ("Basic",       []),
    ],
    "ABS": [
        ("Standard",    []),
    ],
    "ASA": [
        ("Standard",    []),
    ],
    "TPU": [
        ("95A",  ["95a", "shore 95"]),
        ("90A",  ["90a", "shore 90"]),
        ("85A",  ["85a", "shore 85"]),
        ("83A",  ["83a", "shore 83"]),
        ("95A",  []),  # fallback
    ],
    "NYLON": [
        ("PA12", ["pa12", "pa 12", "nylon 12"]),
        ("PA6",  ["pa6", "pa 6", "nylon 6"]),
        ("PA6",  []),
    ],
    "PC":      [("Standard", [])],
    "HIPS":    [("Standard", [])],
    "PVA":     [("Standard", [])],
    "PLA-CF":  [("Standard", [])],
    "PETG-CF": [("Standard", [])],
    "PA-CF":   [("Standard", [])],
}

# Nome colore → (nome_it, hex, famiglia)
COLOR_DB: dict[str, tuple[str, str, str]] = {
    "black":        ("Nero",         "#1a1a1a", "nero"),
    "nero":         ("Nero",         "#1a1a1a", "nero"),
    "nera":         ("Nero",         "#1a1a1a", "nero"),
    "white":        ("Bianco",       "#f0f0f0", "bianco"),
    "bianco":       ("Bianco",       "#f0f0f0", "bianco"),
    "bianca":       ("Bianco",       "#f0f0f0", "bianco"),
    "grey":         ("Grigio",       "#808080", "grigio"),
    "gray":         ("Grigio",       "#808080", "grigio"),
    "grigio":       ("Grigio",       "#808080", "grigio"),
    "dark grey":    ("Grigio scuro", "#404040", "grigio"),
    "light grey":   ("Grigio chiaro","#c0c0c0", "grigio"),
    "red":          ("Rosso",        "#cc0000", "rosso"),
    "rosso":        ("Rosso",        "#cc0000", "rosso"),
    "blue":         ("Blu",          "#0033cc", "blu"),
    "blu":          ("Blu",          "#0033cc", "blu"),
    "navy blue":    ("Blu navy",     "#001f5b", "blu"),
    "sky blue":     ("Azzurro",      "#87ceeb", "blu"),
    "azzurro":      ("Azzurro",      "#87ceeb", "blu"),
    "light blue":   ("Azzurro",      "#87ceeb", "blu"),
    "green":        ("Verde",        "#008000", "verde"),
    "verde":        ("Verde",        "#008000", "verde"),
    "dark green":   ("Verde scuro",  "#004000", "verde"),
    "army green":   ("Verde militare","#4b5320","verde"),
    "yellow":       ("Giallo",       "#ffdd00", "giallo"),
    "giallo":       ("Giallo",       "#ffdd00", "giallo"),
    "orange":       ("Arancione",    "#ff6600", "arancio"),
    "arancione":    ("Arancione",    "#ff6600", "arancio"),
    "arancio":      ("Arancione",    "#ff6600", "arancio"),
    "purple":       ("Viola",        "#660099", "viola"),
    "viola":        ("Viola",        "#660099", "viola"),
    "pink":         ("Rosa",         "#ff69b4", "viola"),
    "rosa":         ("Rosa",         "#ff69b4", "viola"),
    "magenta":      ("Magenta",      "#cc0066", "viola"),
    "brown":        ("Marrone",      "#8b4513", "marrone"),
    "marrone":      ("Marrone",      "#8b4513", "marrone"),
    "gold":         ("Oro",          "#ffd700", "giallo"),
    "oro":          ("Oro",          "#ffd700", "giallo"),
    "silver":       ("Argento",      "#c0c0c0", "grigio"),
    "argento":      ("Argento",      "#c0c0c0", "grigio"),
    "transparent":  ("Trasparente",  "#e8f4f8", "trasparente"),
    "trasparente":  ("Trasparente",  "#e8f4f8", "trasparente"),
    "clear":        ("Trasparente",  "#e8f4f8", "trasparente"),
    "natural":      ("Naturale",     "#f5f0e8", "trasparente"),
    "naturale":     ("Naturale",     "#f5f0e8", "trasparente"),
    "multicolor":   ("Multicolor",   "#888888", "multicolor"),
    "multicolore":  ("Multicolor",   "#888888", "multicolor"),
    "rainbow":      ("Rainbow",      "#888888", "multicolor"),
    "arcobaleno":   ("Rainbow",      "#888888", "multicolor"),
    "bambu green":      ("Bambu Green",   "#4caf50", "verde"),
    "jade green":       ("Jade Green",    "#00a693", "verde"),
    "cyan":             ("Ciano",         "#00bcd4", "blu"),
    "ciano":            ("Ciano",         "#00bcd4", "blu"),
    "teal":             ("Teal",          "#008080", "verde"),
    "turquoise":        ("Turchese",      "#40e0d0", "verde"),
    "turchese":         ("Turchese",      "#40e0d0", "verde"),
    "mint":             ("Menta",         "#98ff98", "verde"),
    "menta":            ("Menta",         "#98ff98", "verde"),
    "lime":             ("Verde lime",    "#32cd32", "verde"),
    "olive":            ("Verde oliva",   "#808000", "verde"),
    "forest green":     ("Verde foresta", "#228b22", "verde"),
    "dark blue":        ("Blu scuro",     "#00008b", "blu"),
    "royal blue":       ("Blu royal",     "#4169e1", "blu"),
    "cobalt blue":      ("Blu cobalto",   "#0047ab", "blu"),
    "indigo":           ("Indaco",        "#4b0082", "viola"),
    "violet":           ("Violetto",      "#8b00ff", "viola"),
    "lavender":         ("Lavanda",       "#e6e6fa", "viola"),
    "lilac":            ("Lilla",         "#c8a2c8", "viola"),
    "hot pink":         ("Rosa acceso",   "#ff69b4", "viola"),
    "light pink":       ("Rosa chiaro",   "#ffb6c1", "viola"),
    "coral":            ("Corallo",       "#ff6347", "rosso"),
    "salmon":           ("Salmone",       "#fa8072", "rosso"),
    "crimson":          ("Cremisi",       "#dc143c", "rosso"),
    "dark red":         ("Rosso scuro",   "#8b0000", "rosso"),
    "wine":             ("Bordeaux",      "#722f37", "rosso"),
    "bordeaux":         ("Bordeaux",      "#722f37", "rosso"),
    "burgundy":         ("Bordeaux",      "#800020", "rosso"),
    "amber":            ("Ambra",         "#ffbf00", "giallo"),
    "yellow green":     ("Giallo-verde",  "#9acd32", "verde"),
    "tan":              ("Sabbia",        "#d2b48c", "marrone"),
    "beige":            ("Beige",         "#f5f5dc", "marrone"),
    "cream":            ("Crema",         "#fffdd0", "bianco"),
    "ivory":            ("Avorio",        "#fffff0", "bianco"),
    "bone":             ("Osso",          "#f9f6ee", "bianco"),
    "off white":        ("Bianco sporco", "#faf9f6", "bianco"),
    "khaki":            ("Kaki",          "#c3b091", "marrone"),
    "sand":             ("Sabbia",        "#c2b280", "marrone"),
    "chocolate":        ("Cioccolato",    "#7b3f00", "marrone"),
    "coffee":           ("Caffè",         "#6f4e37", "marrone"),
    "caramel":          ("Caramello",     "#c68642", "marrone"),
    "bronze":           ("Bronzo",        "#cd7f32", "marrone"),
    "copper":           ("Rame",          "#b87333", "marrone"),
    "rose gold":        ("Oro rosa",      "#b76e79", "viola"),
    "matte black":      ("Nero opaco",    "#1a1a1a", "nero"),
    "matte white":      ("Bianco opaco",  "#f0f0f0", "bianco"),
    "marble":           ("Marmo",         "#c8c8c8", "grigio"),
    "wood":             ("Legno",         "#8b6914", "marrone"),
    "glow":             ("Fosforescente", "#ccff00", "multicolor"),
    "glow in the dark": ("Fosforescente", "#ccff00", "multicolor"),
    "color change":     ("Cambia colore", "#888888", "multicolor"),
    "thermal":          ("Termocromico",  "#888888", "multicolor"),
    "silk gold":        ("Oro silk",      "#ffd700", "giallo"),
    "silk silver":      ("Argento silk",  "#c0c0c0", "grigio"),
    "silk copper":      ("Rame silk",     "#b87333", "marrone"),
    "silk red":         ("Rosso silk",    "#cc0000", "rosso"),
    "silk blue":        ("Blu silk",      "#0033cc", "blu"),
    "silk green":       ("Verde silk",    "#008000", "verde"),
    "galaxy black":     ("Galaxy nero",   "#1a1a1a", "nero"),
    "starlight":        ("Stellato",      "#c8d0e8", "bianco"),
    "brick red":        ("Rosso mattone", "#8b2500", "rosso"),
    "light gray":       ("Grigio chiaro", "#c0c0c0", "grigio"),
    "dark gray":        ("Grigio scuro",  "#404040", "grigio"),
    "charcoal":         ("Antracite",     "#36454f", "grigio"),
    "space gray":       ("Grigio space",  "#6e7681", "grigio"),
    "refill":           (None,            None,      None),   # skip refill
}

WEIGHT_RE = re.compile(
    r'(\d+(?:\.\d+)?)\s*kg\b|(\d+)\s*g\b|(\d+(?:\.\d+)?)\s*kilogram',
    re.IGNORECASE
)


# ── Parsing helpers ───────────────────────────────────────────────────────────

def detect_type(text: str) -> Optional[str]:
    t = text.lower()
    for type_nome, keywords in TYPE_MAP:
        for kw in keywords:
            if kw in t:
                return type_nome
    return None


def detect_variant(type_nome: str, text: str) -> str:
    t = text.lower()
    for variant_nome, keywords in VARIANT_MAP.get(type_nome, []):
        if not keywords:
            return variant_nome  # fallback
        for kw in keywords:
            if kw in t:
                return variant_nome
    return "Basic"


def detect_color(text: str) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """Ritorna (nome_colore, hex, famiglia) cercando nel testo."""
    t = text.lower()
    # cerca match più lungo prima
    for key in sorted(COLOR_DB.keys(), key=len, reverse=True):
        if key in t:
            val = COLOR_DB[key]
            if val[0] is None:  # colore esplicitamente escluso (es. "refill")
                return (None, None, None)
            return val
    return (None, None, None)


def detect_weight(text: str) -> int:
    """Ritorna peso in grammi."""
    m = WEIGHT_RE.search(text)
    if not m:
        return 1000  # default
    if m.group(1):  # kg
        return int(float(m.group(1)) * 1000)
    if m.group(2):  # g
        return int(m.group(2))
    if m.group(3):  # kilogram
        return int(float(m.group(3)) * 1000)
    return 1000


# ── Database helpers ──────────────────────────────────────────────────────────

class DB:
    def __init__(self, url: str, dry_run: bool = False):
        self.conn = psycopg2.connect(url)
        self.conn.autocommit = False
        self.dry_run = dry_run
        self._cache: dict = {}

    def cur(self):
        return self.conn.cursor(cursor_factory=RealDictCursor)

    def commit(self):
        if not self.dry_run:
            self.conn.commit()

    def get_or_create_type(self, nome: str) -> int:
        key = f"type:{nome}"
        if key in self._cache:
            return self._cache[key]
        with self.cur() as c:
            c.execute("SELECT id FROM filament_type WHERE nome = %s", (nome,))
            row = c.fetchone()
            if row:
                self._cache[key] = row["id"]
                return row["id"]
            if self.dry_run:
                log.info(f"  [DRY] CREATE filament_type: {nome}")
                return -1
            c.execute(
                "INSERT INTO filament_type (nome) VALUES (%s) RETURNING id",
                (nome,)
            )
            fid = c.fetchone()["id"]
            self.conn.commit()
            self._cache[key] = fid
            log.info(f"  CREATED filament_type: {nome} (id={fid})")
            return fid

    def get_or_create_variant(self, id_type: int, nome: str) -> int:
        key = f"variant:{id_type}:{nome}"
        if key in self._cache:
            return self._cache[key]
        with self.cur() as c:
            c.execute(
                "SELECT id FROM filament_variant WHERE id_type = %s AND nome = %s",
                (id_type, nome)
            )
            row = c.fetchone()
            if row:
                self._cache[key] = row["id"]
                return row["id"]
            if self.dry_run:
                log.info(f"  [DRY] CREATE filament_variant: type_id={id_type} nome={nome}")
                return -1
            c.execute(
                "INSERT INTO filament_variant (id_type, nome) VALUES (%s, %s) RETURNING id",
                (id_type, nome)
            )
            fid = c.fetchone()["id"]
            self.conn.commit()
            self._cache[key] = fid
            log.info(f"  CREATED filament_variant: {nome} (id={fid})")
            return fid

    def get_or_create_filament(
        self, id_variant: int, id_brand: int,
        colore: Optional[str], colore_hex: Optional[str], colore_famiglia: Optional[str],
        peso_g: int, diametro_mm: float,
        link_immagine: Optional[str], sku: Optional[str],
        is_refill: bool = False,
    ) -> int:
        key = f"filament:{id_variant}:{id_brand}:{colore}:{peso_g}:{diametro_mm}:{is_refill}"
        if key in self._cache:
            return self._cache[key]
        with self.cur() as c:
            c.execute(
                """SELECT id FROM filament
                   WHERE id_variant=%s AND id_brand=%s
                     AND (colore=%s OR (colore IS NULL AND %s IS NULL))
                     AND peso_g=%s AND diametro_mm=%s AND is_refill=%s""",
                (id_variant, id_brand, colore, colore, peso_g, diametro_mm, is_refill)
            )
            row = c.fetchone()
            if row:
                # aggiorna immagine se non ce l'aveva
                if link_immagine:
                    c.execute(
                        "UPDATE filament SET link_immagine=%s WHERE id=%s AND link_immagine IS NULL",
                        (link_immagine, row["id"])
                    )
                    self.conn.commit()
                self._cache[key] = row["id"]
                return row["id"]
            if self.dry_run:
                log.info(f"  [DRY] CREATE filament: variant={id_variant} brand={id_brand} colore={colore} {peso_g}g refill={is_refill}")
                return -1
            c.execute(
                """INSERT INTO filament
                   (id_variant, id_brand, colore, colore_hex, colore_famiglia,
                    peso_g, diametro_mm, link_immagine, sku, is_refill)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (id_variant, id_brand, colore, colore_hex, colore_famiglia,
                 peso_g, diametro_mm, link_immagine, sku, is_refill)
            )
            fid = c.fetchone()["id"]
            self.conn.commit()
            self._cache[key] = fid
            log.info(f"  CREATED filament id={fid}: variant={id_variant} brand={id_brand} {colore} {peso_g}g refill={is_refill}")
            return fid

    def get_or_create_filament_shop(
        self, id_filament: int, id_shop: int, link: str, affiliazione: bool = False
    ) -> int:
        key = f"fs:{id_filament}:{id_shop}"
        if key in self._cache:
            return self._cache[key]
        with self.cur() as c:
            c.execute(
                "SELECT id FROM filament_shop WHERE id_filament=%s AND id_shop=%s",
                (id_filament, id_shop)
            )
            row = c.fetchone()
            if row:
                # aggiorna link se cambiato
                c.execute(
                    "UPDATE filament_shop SET link=%s WHERE id=%s AND link != %s",
                    (link, row["id"], link)
                )
                self.conn.commit()
                self._cache[key] = row["id"]
                return row["id"]
            if self.dry_run:
                log.info(f"  [DRY] CREATE filament_shop: filament={id_filament} shop={id_shop}")
                return -1
            c.execute(
                """INSERT INTO filament_shop (id_filament, id_shop, link, affiliazione, attivo)
                   VALUES (%s,%s,%s,%s,true) RETURNING id""",
                (id_filament, id_shop, link, affiliazione)
            )
            fid = c.fetchone()["id"]
            self.conn.commit()
            self._cache[key] = fid
            return fid

    def insert_price(
        self, id_filament_shop: int, prezzo: float,
        prezzo_scontato: Optional[float], disponibile: bool
    ):
        if self.dry_run:
            log.info(f"  [DRY] PRICE: shop_link={id_filament_shop} €{prezzo}"
                     + (f" → €{prezzo_scontato}" if prezzo_scontato else ""))
            return
        with self.cur() as c:
            c.execute(
                """INSERT INTO price_history
                   (id_filament_shop, prezzo, prezzo_scontato, disponibile, rilevato_at)
                   VALUES (%s,%s,%s,%s,NOW())""",
                (id_filament_shop, prezzo, prezzo_scontato, disponibile)
            )
        self.conn.commit()

    def get_brand_id(self, nome: str) -> Optional[int]:
        with self.cur() as c:
            c.execute("SELECT id FROM brand WHERE nome ILIKE %s", (nome,))
            row = c.fetchone()
            return row["id"] if row else None

    def get_all_brands(self) -> list[dict]:
        """Restituisce tutti i brand attivi: [{id, nome}]."""
        with self.cur() as c:
            c.execute("SELECT id, nome FROM brand WHERE attivo = TRUE ORDER BY nome")
            return [{"id": row["id"], "nome": row["nome"]} for row in c.fetchall()]

    def get_shop_id(self, nome: str) -> Optional[int]:
        with self.cur() as c:
            c.execute("SELECT id FROM shop WHERE nome ILIKE %s", (f"%{nome}%",))
            row = c.fetchone()
            return row["id"] if row else None


# ── Shopify scraper generico ──────────────────────────────────────────────────

def fetch_shopify_products(base_url: str, collection: Optional[str] = None) -> list[dict]:
    """Scarica tutti i prodotti da uno shop Shopify."""
    products = []
    page = 1
    if collection:
        url_tpl = f"{base_url}/collections/{collection}/products.json?limit=250&page={{page}}"
    else:
        url_tpl = f"{base_url}/products.json?limit=250&page={{page}}"

    while True:
        url = url_tpl.format(page=page)
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            log.error(f"Errore fetch {url}: {e}")
            break

        batch = data.get("products", [])
        if not batch:
            break
        products.extend(batch)
        log.info(f"  Pagina {page}: {len(batch)} prodotti (tot {len(products)})")
        if len(batch) < 250:
            break
        page += 1
        time.sleep(0.5)

    return products


def is_filament_product(product: dict) -> bool:
    """Filtra prodotti che sono filamenti 3D."""
    title = product.get("title", "").lower()
    tags = " ".join(product.get("tags", [])).lower()
    combined = title + " " + tags
    # Deve contenere almeno un tipo di materiale
    if detect_type(combined) is None:
        return False
    # Escludi accessori non-filamento (il detect_type sopra già filtra i prodotti
    # senza materiale nel nome, quindi qui escludiamo solo accessori espliciti)
    exclude = ["nozzle", "ugello", "build plate", "piano", "tool", "strumento",
               "coupon", "bundle pack", "starter kit",
               "bag", "sacchetto", "drybox", "filament dryer"]
    for ex in exclude:
        if ex in combined:
            return False
    return True


REGION_CODES = {"uk", "us", "eu", "de", "fr", "it", "ca", "au", "jp"}


def parse_shopify_variant_title(variant_title: str) -> tuple[str, int]:
    """
    Parsa titolo variante Shopify in vari formati:
      'Black / 1KG'       → (Black, 1000)
      'UK / Black'        → (Black, 1000)   ← Elegoo format
      'Nero / 500g'       → (Nero, 500)
      'Black'             → (Black, 1000)
      'PLA / Black'       → (Black, 1000)   ← tipo/colore
    Ritorna (colore_raw, peso_g).
    """
    parts = [p.strip() for p in variant_title.split("/")]
    peso_g = detect_weight(variant_title)

    if len(parts) == 1:
        return parts[0], peso_g

    # Se la prima parte è un codice regione (UK, US, EU...) o tipo materiale
    first = parts[0].lower().strip()
    if first in REGION_CODES or detect_type(first) is not None:
        color_raw = parts[-1]  # prendi l'ultima parte come colore
    else:
        # formato standard: first = colore, last = peso
        color_raw = parts[0]

    return color_raw, peso_g


def process_shopify_product(
    product: dict, brand_id: int, shop_id: int, db: DB, shop_url_prefix: str,
    default_weight_g: int = 1000, url_extra_params: str = "",
    affiliazione: bool = False,
    skip_variant_keywords: list[str] | None = None,
    processed_pairs: set[tuple[int, int]] | None = None,
) -> int:
    """
    Processa un prodotto Shopify e inserisce filament + prezzi nel DB.
    Ritorna il numero di varianti processate.

    skip_variant_keywords: lista di sottostrings (lowercase) nei titoli variante da saltare
      (es. ["rfid"] per saltare varianti con chip RFID).
    Varianti con "refill" nel titolo vengono automaticamente tracciate con is_refill=True.
    Se due varianti mappano allo stesso (fil_id, shop_id), viene processata solo la prima.
    """
    title = product.get("title", "")
    combined = title + " " + " ".join(product.get("tags", []))

    type_nome = detect_type(combined)
    if not type_nome:
        return 0

    variant_nome = detect_variant(type_nome, combined)
    type_id = db.get_or_create_type(type_nome)
    if type_id < 0:
        return 0
    variant_id = db.get_or_create_variant(type_id, variant_nome)
    if variant_id < 0:
        return 0

    # Immagine principale del prodotto
    images = product.get("images", [])
    main_image = images[0]["src"] if images else None
    imgs_by_id = {img["id"]: img["src"] for img in images}

    # Se il prodotto ha più varianti colore diverse e nessuna ha image_id,
    # significa che l'immagine principale è generica (es. solo un colore).
    # In quel caso NON assegniamo l'immagine ai filamenti — mostriamo lo swatch colore.
    variants_list = product.get("variants", [])
    has_variant_images = any(v.get("image_id") for v in variants_list)
    multi_color = len(variants_list) > 1
    use_main_image_fallback = not multi_color or has_variant_images

    _skip_kws = [k.lower() for k in (skip_variant_keywords or [])]
    # Usa il set condiviso passato dall'esterno (per deduplicare cross-prodotto), oppure uno locale
    _processed_pairs: set[tuple[int, int]] = processed_pairs if processed_pairs is not None else set()

    count = 0
    for variant in variants_list:
        v_title = variant.get("title", "Default Title")
        v_lower = v_title.lower()

        # Salta varianti con keyword esplicite (es. RFID)
        if _skip_kws and any(kw in v_lower for kw in _skip_kws):
            log.debug(f"  Skip variante per keyword: {v_title!r}")
            continue

        # Rileva se è un refill (senza bobina)
        is_refill = any(kw in v_lower for kw in ["refill", "no spool", "cardboard spool"])

        price_str = variant.get("price", "0")
        compare_price_str = variant.get("compare_at_price")
        available = variant.get("available", True)
        sku = variant.get("sku") or None

        try:
            price = float(price_str)
        except ValueError:
            continue
        if price <= 0:
            continue

        compare_price = None
        if compare_price_str:
            try:
                cp = float(compare_price_str)
                if cp > 0:  # ignora "0.00" (Shopify placeholder non-sconto)
                    compare_price = cp
            except ValueError:
                pass

        # Determina prezzo scontato
        # Shopify: price = prezzo attuale, compare_at_price = prezzo originale (barrato)
        prezzo = price
        prezzo_scontato = None
        if compare_price and compare_price > price:
            prezzo = compare_price   # prezzo pieno (originale)
            prezzo_scontato = price  # prezzo scontato (corrente)

        # Colore e peso dalla variante
        color_raw, peso_g_detected = parse_shopify_variant_title(v_title)
        # Usa il peso rilevato solo se diverso dal default (1000g)
        peso_g = peso_g_detected if peso_g_detected != 1000 else detect_weight(title + " " + v_title)
        if peso_g == 1000 and default_weight_g != 1000:
            peso_g = default_weight_g

        # Se il titolo variante è solo "Default Title", cerca nel titolo prodotto
        if v_title.lower() == "default title":
            color_raw = title
            peso_g = detect_weight(title) or default_weight_g

        colore, colore_hex, colore_famiglia = detect_color(color_raw)

        # Immagine specifica variante (se disponibile), altrimenti principale
        # solo se non è un prodotto multi-colore senza immagini per variante
        img_id = variant.get("image_id")
        if img_id and img_id in imgs_by_id:
            var_image = imgs_by_id[img_id]
        elif use_main_image_fallback:
            var_image = main_image
        else:
            var_image = None  # lascia il color swatch

        # Link prodotto
        handle = product.get("handle", "")
        product_url = f"{shop_url_prefix}/products/{handle}?variant={variant['id']}"
        if url_extra_params:
            product_url += f"&{url_extra_params}"

        # Crea/trova filamento
        fil_id = db.get_or_create_filament(
            variant_id, brand_id, colore, colore_hex, colore_famiglia,
            peso_g, 1.75, var_image, sku, is_refill=is_refill,
        )
        if fil_id < 0:
            continue

        # Deduplicazione: salta se (fil_id, shop_id) già processato in questa run
        pair = (fil_id, shop_id)
        if pair in _processed_pairs:
            log.debug(f"  Skip duplicato (fil_id={fil_id}, shop_id={shop_id}): {v_title!r}")
            continue
        _processed_pairs.add(pair)

        # Crea/trova filament_shop
        fs_id = db.get_or_create_filament_shop(fil_id, shop_id, product_url, affiliazione=affiliazione)
        if fs_id < 0:
            continue

        # Inserisci prezzo
        db.insert_price(fs_id, prezzo, prezzo_scontato, bool(available))
        count += 1

    return count


# ── Scraper Elegoo ────────────────────────────────────────────────────────────

def scrape_elegoo(db: DB):
    log.info("=== ELEGOO ===")
    brand_id = db.get_brand_id("Elegoo")
    shop_id = db.get_shop_id("Elegoo")
    if not brand_id or not shop_id:
        log.error("Brand o shop Elegoo non trovato nel DB")
        return

    log.info(f"Brand ID: {brand_id}, Shop ID: {shop_id}")

    # Elegoo EU store (eu.elegoo.com) — prezzi in EUR, unica collection "filaments"
    ELEGOO_EU = "https://eu.elegoo.com"
    products_raw = fetch_shopify_products(ELEGOO_EU, "filaments")
    log.info(f"Trovati {len(products_raw)} prodotti nella collection filaments")

    filament_products = [p for p in products_raw if
        detect_type(p.get("title","")) is not None or
        detect_type(" ".join(p.get("tags",[]))) is not None]
    log.info(f"Filtrati {len(filament_products)} filamenti da processare")

    # Salta varianti RFID (stesso filamento ma con chip NFC/RFID — prezzo più alto, stesso articolo)
    ELEGOO_SKIP = ["rfid", " rfid ", "(rfid)", "with rfid"]

    _shared_pairs: set[tuple[int, int]] = set()  # deduplicazione cross-prodotto
    total = 0
    for p in filament_products:
        n = process_shopify_product(p, brand_id, shop_id, db, ELEGOO_EU,
                                    default_weight_g=1000,
                                    skip_variant_keywords=ELEGOO_SKIP,
                                    processed_pairs=_shared_pairs)
        total += n

    log.info(f"Elegoo EU: {total} varianti processate")


# ── Scraper SUNLU ─────────────────────────────────────────────────────────────

SUNLU_SKIP_KEYWORDS = [
    "moq", "bundle", "confezione", "pacchetto", "vip", "accesso", "5kg", "10kg",
    "3kg bobina", "3 kg", "grande bobina", "assortimento", "penna 3d", "essiccatore",
    "dryer", "worry", "clearance", "special offer", "canada only", "kit",
    "8 rotoli", "10 rotoli", "rotoli", "multipack", "multi pack", "set di",
    "valentino", "halloween", "natale", "christmas", "san valentino",
    "promo", "combo", "misto", "mistero", "mystery", "surprise",
    # accessori e non-filamento
    "resina", "resin", "connettore", "saldatore", "kidoodle", "piastra",
    "kollektion", "collection", "buono regalo", "gift card",
    # multipack large spool
    "riciclati",
]


def scrape_sunlu(db: DB):
    log.info("=== SUNLU ===")
    brand_id = db.get_brand_id("Sunlu")
    shop_id = db.get_shop_id("SUNLU")
    if not brand_id or not shop_id:
        log.error("Brand o shop SUNLU non trovato nel DB")
        return

    log.info(f"Brand ID: {brand_id}, Shop ID: {shop_id}")
    products = fetch_shopify_products("https://it.store.sunlu.com")
    log.info(f"Trovati {len(products)} prodotti totali")

    def is_valid_sunlu(p: dict) -> bool:
        title = p.get("title", "").lower()
        tags = " ".join(p.get("tags", [])).lower()
        # Salta bundle, MOQ e kit
        if any(kw in title for kw in SUNLU_SKIP_KEYWORDS):
            return False
        # Salta se ha tag MOQ
        if "moq" in tags:
            return False
        # Salta varianti con titolo troppo lungo (spesso multi-prodotto)
        for v in p.get("variants", []):
            vt = v.get("title", "")
            if "+" in vt and len(vt.split("+")) > 3:
                return False
        return is_filament_product(p)

    filament_products = [p for p in products if is_valid_sunlu(p)]
    log.info(f"Filtrati {len(filament_products)} filamenti da processare")

    _shared_pairs: set[tuple[int, int]] = set()  # deduplicazione cross-prodotto
    total = 0
    for p in filament_products:
        peso_nel_titolo = detect_weight(p.get("title", ""))
        n = process_shopify_product(
            p, brand_id, shop_id, db, "https://it.store.sunlu.com",
            default_weight_g=peso_nel_titolo if peso_nel_titolo else 1000,
            url_extra_params=SUNLU_REF,
            affiliazione=True,
            processed_pairs=_shared_pairs,
        )
        total += n

    log.info(f"SUNLU: {total} varianti processate")


# ── AWIN Affiliate config ─────────────────────────────────────────────────────

# AWIN — credenziali personali
AWIN_AFFILIATE_ID = "2803624"   # publisher ID
ESUN_AWIN_MID     = "99267"     # eSUN EU merchant ID

# SUNLU referral
SUNLU_REF = "sca_ref=10792738.zNEEYsYDBi"


def make_awin_link(merchant_id: str, dest_url: str) -> str:
    """Genera link di tracking AWIN per il merchant specificato."""
    encoded = quote(dest_url, safe="")
    return (
        f"https://www.awin1.com/cread.php"
        f"?awinmid={merchant_id}&awinaffid={AWIN_AFFILIATE_ID}&ued={encoded}"
    )


# ── Scraper eSUN EU ────────────────────────────────────────────────────────────

ESUN_BASE = "https://esun3dstoreeu.com"
ESUN_CDN  = "https://ueeshop.ly200-cdn.com/u_file/UPBC/UPBC810"

ESUN_SKIP = [
    "ebox", "evac", "resin", "wash", "standard-resin", "hard-tough",
    "pla-cmyk", "pla-uv-color", "luminous-rainbow", "silk-rainbow",
    "silk-candy", "silk-magic", "silk-metal",  # speciali multi-color
    "chameleon", "magic",  # color-change
    "10-rolls", "10rolls",
]


def fetch_esun_product(url: str) -> Optional[dict]:
    """
    Scarica una pagina prodotto eSUN EU ed estrae:
    - prezzo EUR (da meta og)
    - disponibilità (da JSON-LD)
    - immagine principale
    - lista colori con immagine specifica (da product_data JS)
    """
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        html = r.text
    except Exception as e:
        log.warning(f"  Errore fetch {url}: {e}")
        return None

    # Prezzo dal meta tag (più affidabile del JSON-LD per eSUN)
    price_m = re.search(
        r'<meta property="product:price:amount" content="([0-9.]+)"', html
    )
    if not price_m:
        return None
    try:
        price = float(price_m.group(1))
    except ValueError:
        return None
    if price <= 0:
        return None

    # Disponibilità da JSON-LD
    available = True
    jld_m = re.search(r'"availability"\s*:\s*"([^"]+)"', html)
    if jld_m:
        available = "InStock" in jld_m.group(1)

    # Immagine principale da JSON-LD
    img_m = re.search(r'"image"\s*:\s*\["([^"]+)"', html)
    main_image = img_m.group(1) if img_m else None

    # product_data JS — colori e immagini per variante
    colors: list[dict] = []  # [{name, image_url}]
    pd_start = html.find("var product_data = {")
    if pd_start != -1:
        pd_start = html.find("{", pd_start)
        depth = 0; pd_end = pd_start
        for i, c in enumerate(html[pd_start:], pd_start):
            if c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0: pd_end = i + 1; break
        try:
            pd = json.loads(html[pd_start:pd_end])
            opts = pd.get("option_data", [])
            if opts:
                color_opt = next(
                    (o for o in opts if o.get("Name", "").lower() == "color"), None
                )
                if color_opt:
                    for color_name, cdata in color_opt.get("Data", {}).items():
                        img_path = cdata.get("main", "")
                        if img_path:
                            # img_path = "/u_file/YYYY/MM/products/xxx.jpg"
                            # CDN base termina già con /UPBC810, quindi strip "/u_file/"
                            suffix = img_path.lstrip("/")
                            if suffix.startswith("u_file/"):
                                suffix = suffix[len("u_file/"):]
                            img_url = f"{ESUN_CDN}/{suffix}"
                        else:
                            img_url = main_image
                        colors.append({"name": color_name, "image": img_url})
        except Exception as e:
            log.debug(f"  Errore parse product_data: {e}")

    return {
        "price": price,
        "available": available,
        "main_image": main_image,
        "colors": colors,
    }


def scrape_esun(db: DB):
    log.info("=== eSUN EU ===")
    brand_id = db.get_brand_id("eSUN")
    shop_id = db.get_shop_id("eSUN")
    if not brand_id or not shop_id:
        log.error("Brand o shop eSUN non trovato nel DB")
        return

    log.info(f"Brand ID: {brand_id}, Shop ID: {shop_id}")
    _processed_pairs: set[tuple[int, int]] = set()  # (fil_id, shop_id) già processati in questo run

    # 1. Raccogli URL prodotti dalla collection filamento
    try:
        r = requests.get(f"{ESUN_BASE}/collections/3d-filament", headers=HEADERS, timeout=20)
        r.raise_for_status()
        html = r.text
    except Exception as e:
        log.error(f"Errore fetch collection eSUN: {e}")
        return

    product_paths = sorted(set(re.findall(r'href="(/products/[^"?#]+)"', html)))
    product_paths = [
        p for p in product_paths
        if not any(skip in p for skip in ESUN_SKIP)
    ]
    log.info(f"Trovati {len(product_paths)} URL filamenti eSUN")

    total = 0
    for path in product_paths:
        slug = path.lstrip("/products/").replace("/products/", "")
        title_guess = slug.replace("-", " ").title()
        combined = title_guess

        type_nome = detect_type(combined)
        if not type_nome:
            log.debug(f"  Skip tipo non rilevato: {slug}")
            continue

        variant_nome = detect_variant(type_nome, combined)
        type_id = db.get_or_create_type(type_nome)
        if type_id < 0:
            continue
        variant_id = db.get_or_create_variant(type_id, variant_nome)
        if variant_id < 0:
            continue

        peso_g = detect_weight(combined + " 1kg")
        url = ESUN_BASE + path

        data = fetch_esun_product(url)
        if not data:
            log.debug(f"  Skip (fetch fallito): {slug}")
            continue

        prezzo = data["price"]
        available = data["available"]

        # Link affiliato AWIN (se configurato)
        use_awin = (AWIN_AFFILIATE_ID != "TODO_YOUR_AFFILIATE_ID"
                    and ESUN_AWIN_MID != "TODO_ESUN_MERCHANT_ID")
        affiliate_url = make_awin_link(ESUN_AWIN_MID, url) if use_awin else url

        colors = data["colors"]
        if not colors:
            # Nessun colore rilevato: crea filamento generico
            colore, colore_hex, colore_famiglia = detect_color(combined)
            fil_id = db.get_or_create_filament(
                variant_id, brand_id, colore, colore_hex, colore_famiglia,
                peso_g, 1.75, data["main_image"], None
            )
            if fil_id < 0:
                continue
            pair = (fil_id, shop_id)
            if pair in _processed_pairs:
                log.debug(f"  Skip duplicato (fil_id={fil_id})")
                continue
            _processed_pairs.add(pair)
            fs_id = db.get_or_create_filament_shop(fil_id, shop_id, affiliate_url, affiliazione=use_awin)
            if fs_id >= 0:
                db.insert_price(fs_id, prezzo, None, available)
                total += 1
        else:
            # Crea un filamento per ogni colore
            for color_entry in colors:
                color_name = color_entry["name"]
                color_img = color_entry["image"]
                colore, colore_hex, colore_famiglia = detect_color(color_name)
                fil_id = db.get_or_create_filament(
                    variant_id, brand_id, colore, colore_hex, colore_famiglia,
                    peso_g, 1.75, color_img, None
                )
                if fil_id < 0:
                    continue
                pair = (fil_id, shop_id)
                if pair in _processed_pairs:
                    log.debug(f"  Skip duplicato colore (fil_id={fil_id})")
                    continue
                _processed_pairs.add(pair)
                fs_id = db.get_or_create_filament_shop(fil_id, shop_id, affiliate_url, affiliazione=use_awin)
                if fs_id >= 0:
                    db.insert_price(fs_id, prezzo, None, available)
                    total += 1

        time.sleep(0.5)

    log.info(f"eSUN EU: {total} varianti processate")


# ── Scraper Bambu Lab EU ──────────────────────────────────────────────────────


# Slug-keyword di accessori Bambu che contengono "filament" ma non sono filamenti
BAMBU_ACCESSORY_SLUGS = [
    "sensor", "buffer", "cutter", "hub", "funnel", "retraction",
    "adapter", "swatch", "guide", "protection", "idler", "pad",
    "beginner", "replacement", "assembly", "board", "connection",
]


def _parse_bambu_variant_name(name: str) -> tuple[str, int, bool]:
    """
    Parsa il nome variante Bambu da JSON-LD hasVariant.
    Formato: "PLA Basic - Jade White (10100) / Refill / 1kg"
                          o "PLA Basic - Black / 1kg"
    Ritorna (color_raw, peso_g, is_refill).
    """
    # Separa la parte colore (dopo " - ") dal resto
    if " - " in name:
        rest = name.split(" - ", 1)[1]
    else:
        rest = name

    parts = [p.strip() for p in rest.split("/")]

    # Prima parte = colore (potenzialmente con codice es. "Jade White (10100)")
    color_raw = re.sub(r"\s*\([^)]+\)", "", parts[0]).strip()

    # Cerca peso e is_refill nelle parti rimanenti
    is_refill = any("refill" in p.lower() for p in parts[1:])
    peso_g = 1000
    for p in parts[1:]:
        w = detect_weight(p + " 1kg")
        if w != 1000 or "kg" in p.lower() or "g" in p.lower():
            peso_g = w
            break

    return color_raw, peso_g, is_refill


def fetch_bambu_product_variants(url: str) -> list[dict]:
    """
    Scarica una pagina prodotto Bambu Lab ed estrae le varianti
    dal JSON-LD ProductGroup.hasVariant.
    Ogni variante contiene: name, color_raw, peso_g, is_refill, price,
    available, image, variant_url, sku.
    """
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        if r.status_code == 429:
            log.warning("  Rate limit Bambu, attendo 60s...")
            time.sleep(60)
            r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        html = r.text
    except Exception as e:
        log.warning(f"  Errore fetch {url}: {e}")
        return []

    jld_blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.DOTALL | re.IGNORECASE
    )

    variants = []
    for block in jld_blocks:
        try:
            ld = json.loads(block)
            items = ld if isinstance(ld, list) else [ld]
            for item in items:
                if item.get("@type") not in ("ProductGroup", "Product"):
                    continue
                has_variant = item.get("hasVariant", [])
                if not has_variant and item.get("@type") == "Product":
                    # Singola variante
                    has_variant = [item]
                for v in has_variant:
                    name = v.get("name", "")
                    sku = v.get("sku")
                    img = v.get("image", "")
                    if isinstance(img, list):
                        img = img[0] if img else ""
                    offers = v.get("offers", {})
                    if isinstance(offers, list):
                        offers = offers[0] if offers else {}
                    try:
                        price = float(offers.get("price", 0))
                    except (ValueError, TypeError):
                        continue
                    if price <= 0:
                        continue
                    avail_str = offers.get("availability", "")
                    available = "InStock" in avail_str if avail_str else True
                    variant_url = offers.get("url", url)
                    color_raw, peso_g, is_refill = _parse_bambu_variant_name(name)
                    variants.append({
                        "name": name,
                        "color_raw": color_raw,
                        "peso_g": peso_g,
                        "is_refill": is_refill,
                        "price": price,
                        "available": available,
                        "image": img,
                        "variant_url": variant_url,
                        "sku": sku,
                    })
        except Exception:
            continue
        if variants:
            break

    return variants


def scrape_bambu(db: DB):
    """
    Scraper Bambu Lab EU.
    Usa la sitemap per trovare i prodotti filamento, poi estrae le varianti
    per colore/peso dal JSON-LD ProductGroup.hasVariant di ogni pagina.
    """
    log.info("=== BAMBU LAB EU ===")
    brand_id = db.get_brand_id("Bambu Lab")
    shop_id = db.get_shop_id("Bambu")
    if not brand_id or not shop_id:
        log.error("Brand o shop Bambu Lab non trovato nel DB")
        return

    log.info(f"Brand ID: {brand_id}, Shop ID: {shop_id}")
    BAMBU_EU = "https://eu.store.bambulab.com"

    # Recupera URL prodotti dalla sitemap
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    seen_handles: set[str] = set()
    product_urls: list[str] = []

    sitemap_list: list[str] = []
    try:
        r = requests.get(f"{BAMBU_EU}/sitemap.xml", headers=HEADERS, timeout=15)
        if r.ok:
            root = ET.fromstring(r.text)
            sitemap_list = [
                loc.text for loc in root.findall(".//sm:loc", ns)
                if loc.text and "sitemap_products" in loc.text
            ]
    except Exception:
        pass
    if not sitemap_list:
        sitemap_list = [f"{BAMBU_EU}/sitemap_products_{i}.xml" for i in range(1, 4)]

    for sm_url in sitemap_list:
        try:
            r = requests.get(sm_url, headers=HEADERS, timeout=15)
            if not r.ok:
                break
            root = ET.fromstring(r.text)
            for loc in root.findall(".//sm:loc", ns):
                if not loc.text or "/products/" not in loc.text:
                    continue
                handle = loc.text.split("/products/")[-1].lower().rstrip("/")
                if "filament" not in handle:
                    continue
                if any(kw in handle for kw in BAMBU_ACCESSORY_SLUGS):
                    continue
                if handle not in seen_handles:
                    seen_handles.add(handle)
                    product_urls.append(loc.text)
        except Exception as e:
            log.debug(f"  Sitemap {sm_url}: {e}")
            break

    log.info(f"Trovati {len(product_urls)} URL prodotti filamento da processare")

    _processed_pairs: set[tuple[int, int]] = set()
    total = 0

    for url in product_urls:
        handle = url.split("/products/")[-1].lower().rstrip("/")
        # Controlla tipo dal titolo slug prima di fare la richiesta
        title_from_slug = handle.replace("-", " ")
        if not detect_type(title_from_slug):
            log.debug(f"  Skip tipo non rilevato (slug): {handle}")
            continue

        variants = fetch_bambu_product_variants(url)
        if not variants:
            log.debug(f"  Skip (nessuna variante): {handle}")
            time.sleep(1)
            continue

        # Rileva tipo e variante dal nome del primo elemento
        type_nome = detect_type(variants[0]["name"] + " " + title_from_slug)
        if not type_nome:
            log.debug(f"  Skip tipo non rilevato: {handle}")
            time.sleep(1)
            continue

        variant_nome = detect_variant(type_nome, variants[0]["name"] + " " + title_from_slug)
        type_id = db.get_or_create_type(type_nome)
        if type_id < 0:
            continue
        variant_id = db.get_or_create_variant(type_id, variant_nome)
        if variant_id < 0:
            continue

        for v in variants:
            colore, colore_hex, colore_famiglia = detect_color(v["color_raw"])
            fil_id = db.get_or_create_filament(
                variant_id, brand_id, colore, colore_hex, colore_famiglia,
                v["peso_g"], 1.75, v["image"] or None, v["sku"],
                is_refill=v["is_refill"],
            )
            if fil_id < 0:
                continue

            pair = (fil_id, shop_id)
            if pair in _processed_pairs:
                log.debug(f"  Skip duplicato (fil_id={fil_id}): {v['name']}")
                continue
            _processed_pairs.add(pair)

            fs_id = db.get_or_create_filament_shop(fil_id, shop_id, v["variant_url"])
            if fs_id < 0:
                continue

            db.insert_price(fs_id, v["price"], None, v["available"])
            total += 1

        time.sleep(1)  # rate limiting

    log.info(f"Bambu Lab: {total} varianti processate")


# ── Scraper 3DJake IT ─────────────────────────────────────────────────────────

DJAKE_BASE = "https://www.3djake.it"
DJAKE_SITEMAP = "https://www.3djake.it/sitemap-p.xml"

# Keyword per filtrare URL filamento dalla sitemap (slug URL)
DJAKE_FILAMENT_KEYWORDS = [
    "filament", "pla", "petg", "abs", "asa", "tpu", "nylon",
    "filamento", "polyamide", "polycarbonate",
]

# Keyword per saltare prodotti non-filamento
DJAKE_SKIP_SLUGS = [
    # Resine
    "resina", "resin", "lcd-resin", "msla",
    # Accessori hardware
    "nozzle", "ugello", "build-plate", "tool", "starter-kit",
    "dryer", "essiccatore", "accessori", "accessory",
    # Schermi / parti di ricambio
    "screen", "schermo", "display", "lcd", "fep-film", "fep", "nfep", "release-film",
    "spare", "ricambio", "replacement",
    # Stampanti
    "printer", "stampante",
    # Altro
    "wash-and-cure", "wash", "cure",
]

# Ulteriore validazione post-fetch: il nome prodotto deve contenere un materiale filamento
DJAKE_NAME_MUST_CONTAIN = [
    "pla", "petg", "abs", "asa", "tpu", "nylon", "filament", "filamento",
    "polyamide", "polycarbonate", "pa-cf", "pa cf", "petg-cf",
]

# Peso comuni in formato "X,XX kg" usato da 3DJake nei titoli italiani
DJAKE_WEIGHT_RE = re.compile(
    r'(\d+(?:[.,]\d+)?)\s*kg\b|(\d+)\s*g\b',
    re.IGNORECASE
)


def detect_weight_djake(text: str) -> int:
    """Parsa pesi nel formato italiano di 3DJake (es. '0,22 kg', '1 kg')."""
    m = DJAKE_WEIGHT_RE.search(text)
    if not m:
        return 1000
    if m.group(1):  # kg (con virgola decimale italiana)
        return int(float(m.group(1).replace(",", ".")) * 1000)
    if m.group(2):  # g
        return int(m.group(2))
    return 1000


def fetch_djake_sitemap() -> list[str]:
    """Scarica sitemap-p.xml e restituisce gli URL prodotto filamento."""
    try:
        r = requests.get(DJAKE_SITEMAP, headers=HEADERS, timeout=20)
        r.raise_for_status()
        root = ET.fromstring(r.text)
    except Exception as e:
        log.error(f"Errore fetch sitemap 3DJake: {e}")
        return []

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    all_urls = [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]

    fil_urls = []
    for u in all_urls:
        slug = u.rstrip("/").split("/")[-1].lower()
        # Deve contenere almeno una keyword filamento
        if not any(kw in slug for kw in DJAKE_FILAMENT_KEYWORDS):
            continue
        # Non deve contenere keyword da saltare
        if any(kw in slug for kw in DJAKE_SKIP_SLUGS):
            continue
        fil_urls.append(u)

    return fil_urls


def fetch_djake_product(url: str) -> Optional[dict]:
    """
    Scarica una pagina prodotto 3DJake e estrae dati dal JSON-LD Product.
    Ritorna dict con: name, brand, price, available, image, sku, shipping
    oppure None se la pagina non è un prodotto filamento valido.
    """
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        html = r.text
    except Exception as e:
        log.warning(f"  Errore fetch {url}: {e}")
        return None

    # Cerca tutti i blocchi JSON-LD
    jld_blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.DOTALL | re.IGNORECASE
    )

    product_ld = None
    for block in jld_blocks:
        try:
            data = json.loads(block)
            # Può essere un array o un singolo oggetto
            if isinstance(data, list):
                for item in data:
                    if item.get("@type") == "Product":
                        product_ld = item
                        break
            elif data.get("@type") == "Product":
                product_ld = data
            if product_ld:
                break
        except Exception:
            continue

    if not product_ld:
        return None

    name = product_ld.get("name", "")
    sku = product_ld.get("sku")
    brand_name = ""
    brand_obj = product_ld.get("brand", {})
    if isinstance(brand_obj, dict):
        brand_name = brand_obj.get("name", "")

    # Prezzo e disponibilità da offers
    offers = product_ld.get("offers", {})
    if isinstance(offers, list):
        offers = offers[0] if offers else {}

    try:
        price = float(offers.get("price", 0))
    except (ValueError, TypeError):
        return None
    if price <= 0:
        return None

    avail_str = offers.get("availability", "")
    available = "InStock" in avail_str

    # Spedizione
    shipping = 0.0
    shipping_rate = offers.get("shippingRate", {}) or offers.get("priceSpecification", {})
    if isinstance(shipping_rate, dict):
        try:
            shipping = float(shipping_rate.get("value", 0) or 0)
        except (ValueError, TypeError):
            shipping = 0.0

    # Immagine principale
    images = product_ld.get("image", [])
    if isinstance(images, str):
        images = [images]
    main_image = images[0] if images else None

    return {
        "name": name,
        "brand": brand_name,
        "price": price,
        "available": available,
        "image": main_image,
        "sku": sku,
        "shipping": shipping,
    }


def scrape_3djake(db: DB):
    log.info("=== 3DJAKE IT ===")
    shop_id = db.get_shop_id("3DJake IT")
    if not shop_id:
        log.error("Shop 3DJake non trovato nel DB (aggiungilo con nome '3DJake')")
        return

    log.info(f"Shop ID: {shop_id}")

    # Carica brand dal DB dinamicamente (evita lista hardcoded)
    all_brands = db.get_all_brands()  # [{id, nome}]
    # Ordina per lunghezza decrescente per match più specifico prima (es. "Bambu Lab" prima di "Bambu")
    all_brands_sorted = sorted(all_brands, key=lambda b: len(b["nome"]), reverse=True)

    fil_urls = fetch_djake_sitemap()
    log.info(f"Trovati {len(fil_urls)} URL filamenti da processare")

    _processed_pairs: set[tuple[int, int]] = set()
    total = 0
    skipped = 0

    for url in fil_urls:
        data = fetch_djake_product(url)
        if not data:
            skipped += 1
            time.sleep(0.3)
            continue

        name = data["name"]
        brand_name = data["brand"]

        # Validazione extra: il nome prodotto deve contenere un materiale filamento
        name_lower = name.lower()
        if not any(kw in name_lower for kw in DJAKE_NAME_MUST_CONTAIN):
            log.debug(f"  Skip non-filamento (nome): {name}")
            skipped += 1
            time.sleep(0.3)
            continue

        # Trova brand nel DB — prima dal campo brand del JSON-LD, poi cercando nel nome
        brand_id = db.get_brand_id(brand_name) if brand_name else None
        if not brand_id:
            for b in all_brands_sorted:
                if b["nome"].lower() in name_lower:
                    brand_id = b["id"]
                    break

        if not brand_id:
            log.debug(f"  Skip brand non trovato: {brand_name!r} — {name}")
            skipped += 1
            time.sleep(0.3)
            continue

        # Detect tipo e variante dal nome prodotto
        type_nome = detect_type(name)
        if not type_nome:
            log.debug(f"  Skip tipo non rilevato: {name}")
            skipped += 1
            time.sleep(0.3)
            continue

        variant_nome = detect_variant(type_nome, name)
        type_id = db.get_or_create_type(type_nome)
        if type_id < 0:
            continue
        variant_id = db.get_or_create_variant(type_id, variant_nome)
        if variant_id < 0:
            continue

        # Colore e peso
        colore, colore_hex, colore_famiglia = detect_color(name)
        peso_g = detect_weight_djake(name)

        fil_id = db.get_or_create_filament(
            variant_id, brand_id, colore, colore_hex, colore_famiglia,
            peso_g, 1.75, data["image"], data["sku"]
        )
        if fil_id < 0:
            time.sleep(0.3)
            continue

        pair = (fil_id, shop_id)
        if pair in _processed_pairs:
            log.debug(f"  Skip duplicato 3DJake (fil_id={fil_id}): {name}")
            time.sleep(0.3)
            continue
        _processed_pairs.add(pair)

        fs_id = db.get_or_create_filament_shop(fil_id, shop_id, url, affiliazione=False)
        if fs_id < 0:
            time.sleep(0.3)
            continue

        db.insert_price(fs_id, data["price"], None, data["available"])
        total += 1

        log.debug(f"  OK: {name} — €{data['price']} ({'in stock' if data['available'] else 'out of stock'})")
        time.sleep(0.3)  # rate limiting gentile

    log.info(f"3DJake IT: {total} prodotti processati, {skipped} saltati")


# ── Scraper Amazon IT ─────────────────────────────────────────────────────────

AMAZON_TAG = "pignabot-21"
AMAZON_BASE = "https://www.amazon.it"

# User-agent pool per rotazione
AMAZON_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

# Query di ricerca per tipologia di filamento (brand × tipo)
# Formato: (query_string, brand_hint) — brand_hint per filtrare brand in DB
AMAZON_QUERIES = [
    # Elegoo
    ("Elegoo filamento PLA 1kg",        "Elegoo"),
    ("Elegoo filamento PETG 1kg",       "Elegoo"),
    ("Elegoo filamento PLA+ 1kg",       "Elegoo"),
    ("Elegoo filamento ABS 1kg",        "Elegoo"),
    ("Elegoo PLA Rapid filamento",      "Elegoo"),
    # SUNLU
    ("SUNLU filamento PLA 1kg",         "Sunlu"),
    ("SUNLU filamento PETG 1000g",      "Sunlu"),
    ("SUNLU filamento TPU 1kg",         "Sunlu"),
    ("SUNLU filamento PLA+ 1kg",        "Sunlu"),
    # eSUN
    ("eSUN filamento PLA+ 1kg",         "eSUN"),
    ("eSUN filamento PETG 1kg",         "eSUN"),
    ("eSUN filamento ABS+ 1kg",         "eSUN"),
    ("eSUN filamento TPU 1kg",          "eSUN"),
    # Bambu Lab
    ("Bambu Lab filamento PLA Basic",   "Bambu Lab"),
    ("Bambu Lab filamento PLA Matte",   "Bambu Lab"),
    ("Bambu Lab filamento PETG HF",     "Bambu Lab"),
    ("Bambu Lab filamento ASA 1kg",     "Bambu Lab"),
    # Generico per catturare altri brand
    ("filamento PLA 1kg stampante 3D",  None),
    ("filamento PETG 1kg stampante 3D", None),
    ("filamento TPU flessibile 1kg",    None),
    ("filamento PLA-CF carbonio 1kg",   None),
]


def _amazon_session() -> requests.Session:
    """Crea una sessione requests con header Amazon-compatible."""
    s = requests.Session()
    s.headers.update({
        "User-Agent": random.choice(AMAZON_USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.amazon.it/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    })
    return s


def _parse_amazon_price(soup_elem) -> Optional[float]:
    """Estrae il prezzo (float) da un contenitore a-price di Amazon."""
    if not soup_elem:
        return None
    whole = soup_elem.find("span", class_="a-price-whole")
    frac = soup_elem.find("span", class_="a-price-fraction")
    if whole:
        txt = whole.get_text(strip=True).replace(".", "").replace(",", "") + "." + (frac.get_text(strip=True) if frac else "00")
        try:
            return float(txt)
        except ValueError:
            pass
    # Fallback: testo completo del contenitore
    raw = soup_elem.get_text(strip=True).replace("€", "").replace("\xa0", "").strip()
    raw = re.sub(r"[^\d,.]", "", raw).replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return None


def scrape_amazon_search(session: requests.Session, query: str) -> list[dict]:
    """
    Cerca su Amazon IT e ritorna i primi risultati come lista di dict:
    {asin, title, price, available, image, affiliate_url}
    """
    url = f"{AMAZON_BASE}/s?k={quote(query)}&i=industrial"
    try:
        r = session.get(url, timeout=15)
        r.raise_for_status()
    except Exception as e:
        log.warning(f"  Amazon search error ({query!r}): {e}")
        return []

    if r.status_code == 503 or "To discuss automated access" in r.text:
        log.warning(f"  Amazon blocked (503): {query!r}")
        return []

    soup = BeautifulSoup(r.text, "lxml")
    results = []

    for card in soup.find_all("div", {"data-component-type": "s-search-result"}):
        asin = card.get("data-asin", "").strip()
        if not asin or len(asin) != 10:
            continue

        # Titolo
        title_el = card.find("h2")
        title = title_el.get_text(strip=True) if title_el else ""
        if not title:
            continue

        # Prezzo dal contenitore a-price
        price_container = card.find("span", class_="a-price")
        price = _parse_amazon_price(price_container)

        # Prezzo barrato (prezzo originale)
        compare_container = card.find("span", {"class": re.compile(r"a-price.*a-text-price")})
        compare_price = _parse_amazon_price(compare_container) if compare_container != price_container else None

        # Disponibilità
        avail_el = card.find("span", class_="a-size-base-plus")
        available = True
        if avail_el and any(kw in avail_el.get_text() for kw in ["Non disponibile", "Esaurito", "Temporaneamente"]):
            available = False

        # Immagine
        img_el = card.find("img", class_="s-image")
        image = img_el.get("src", "") if img_el else ""

        affiliate_url = f"{AMAZON_BASE}/dp/{asin}?tag={AMAZON_TAG}"

        results.append({
            "asin": asin,
            "title": title,
            "price": price,
            "compare_price": compare_price,
            "available": available,
            "image": image,
            "affiliate_url": affiliate_url,
        })

    return results


def scrape_amazon(db: DB):
    log.info("=== AMAZON IT ===")
    shop_id = db.get_shop_id("Amazon IT")
    if not shop_id:
        log.error("Shop 'Amazon IT' non trovato nel DB — aggiungilo prima nell'admin")
        return

    log.info(f"Shop ID: {shop_id}")

    all_brands = db.get_all_brands()
    all_brands_sorted = sorted(all_brands, key=lambda b: len(b["nome"]), reverse=True)

    session = _amazon_session()
    _processed_pairs: set[tuple[int, int]] = set()
    total = 0
    skipped = 0

    for query, brand_hint in AMAZON_QUERIES:
        log.info(f"  Ricerca: {query!r}")
        results = scrape_amazon_search(session, query)
        log.debug(f"    Trovati {len(results)} risultati")

        for item in results:
            title = item["title"]
            price = item["price"]

            # Salta se non ha prezzo
            if not price or price <= 0:
                skipped += 1
                continue

            # Validazione: il titolo deve contenere un materiale filamento
            title_lower = title.lower()
            if not any(kw in title_lower for kw in DJAKE_NAME_MUST_CONTAIN):
                log.debug(f"    Skip non-filamento: {title[:60]}")
                skipped += 1
                continue

            # Trova brand nel DB
            # IMPORTANTE: verifica che il titolo contenga effettivamente il brand
            brand_id = None
            if brand_hint and brand_hint.lower() in title_lower:
                brand_id = db.get_brand_id(brand_hint)
            if not brand_id:
                for b in all_brands_sorted:
                    if b["nome"].lower() in title_lower:
                        brand_id = b["id"]
                        break

            if not brand_id:
                log.debug(f"    Skip brand non trovato: {title[:60]}")
                skipped += 1
                continue

            # Rileva tipo, variante, colore, peso dal titolo
            type_nome = detect_type(title)
            if not type_nome:
                log.debug(f"    Skip tipo non rilevato: {title[:60]}")
                skipped += 1
                continue

            variant_nome = detect_variant(type_nome, title)
            type_id = db.get_or_create_type(type_nome)
            if type_id < 0:
                continue
            variant_id = db.get_or_create_variant(type_id, variant_nome)
            if variant_id < 0:
                continue

            colore, colore_hex, colore_famiglia = detect_color(title)
            peso_g = detect_weight(title) or 1000
            is_refill = any(kw in title_lower for kw in ["refill", "no spool", "cardboard spool"])

            fil_id = db.get_or_create_filament(
                variant_id, brand_id, colore, colore_hex, colore_famiglia,
                peso_g, 1.75, item["image"] or None, None,
                is_refill=is_refill,
            )
            if fil_id < 0:
                continue

            pair = (fil_id, shop_id)
            if pair in _processed_pairs:
                log.debug(f"    Skip duplicato (fil_id={fil_id})")
                continue
            _processed_pairs.add(pair)

            fs_id = db.get_or_create_filament_shop(fil_id, shop_id, item["affiliate_url"], affiliazione=True)
            if fs_id < 0:
                continue

            # Prezzi: se c'è compare_price, è il prezzo originale barrato
            prezzo = item["price"]
            prezzo_scontato = None
            if item.get("compare_price") and item["compare_price"] > prezzo:
                prezzo_scontato = prezzo
                prezzo = item["compare_price"]

            db.insert_price(fs_id, prezzo, prezzo_scontato, item["available"])
            total += 1
            log.debug(f"    OK: {title[:70]} — €{item['price']}")

        # Pausa tra query per evitare rate limiting
        time.sleep(random.uniform(3, 6))
        # Ogni 5 query, rinnova la sessione con nuovo user-agent
        if (AMAZON_QUERIES.index((query, brand_hint)) + 1) % 5 == 0:
            session = _amazon_session()
            time.sleep(random.uniform(5, 10))

    log.info(f"Amazon IT: {total} varianti processate, {skipped} saltate")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Filament Finder Scraper")
    parser.add_argument("--shop", choices=["elegoo", "sunlu", "bambu", "esun", "3djake", "amazon", "all"], default="all")
    parser.add_argument("--dry-run", action="store_true", help="Non scrive nel DB")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if args.verbose:
        log.setLevel(logging.DEBUG)

    if args.dry_run:
        log.info("=== DRY RUN — nessuna scrittura nel DB ===")

    try:
        db = DB(DB_URL, dry_run=args.dry_run)
        log.info("Connessione DB OK")
    except Exception as e:
        log.error(f"Errore connessione DB: {e}")
        sys.exit(1)

    start = datetime.now()

    if args.shop in ("elegoo", "all"):
        scrape_elegoo(db)

    if args.shop in ("sunlu", "all"):
        scrape_sunlu(db)

    if args.shop in ("esun", "all"):
        scrape_esun(db)

    if args.shop in ("bambu", "all"):
        scrape_bambu(db)

    if args.shop in ("3djake", "all"):
        scrape_3djake(db)

    if args.shop in ("amazon", "all"):
        scrape_amazon(db)

    elapsed = (datetime.now() - start).total_seconds()
    log.info(f"=== Completato in {elapsed:.1f}s ===")


if __name__ == "__main__":
    main()
