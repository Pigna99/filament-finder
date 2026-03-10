#!/usr/bin/env python3
"""
Cerca su Amazon IT i filamenti consigliati per ogni guida
e stampa il codice TypeScript da incollare in guide.ts.

Usa le credenziali Amazon PA-API del gaming-deal-bot.

Esecuzione:
  cd "c:/Users/andre/Documents/BOT TELEGRAM/filament-finder/scripts"
  /opt/gaming-deal-bot/venv/bin/python fetch-amazon-guide-products.py
"""
import asyncio
import hashlib
import hmac
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Carica .env del gaming-deal-bot
BOT_ENV = Path(__file__).parent.parent.parent / "gaming-deal-bot" / ".env"
if BOT_ENV.exists():
    for line in BOT_ENV.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

try:
    import aiohttp
except ImportError:
    print("Installa aiohttp: pip install aiohttp", file=sys.stderr)
    sys.exit(1)

ACCESS_KEY   = os.getenv("AMAZON_ACCESS_KEY", "")
SECRET_KEY   = os.getenv("AMAZON_SECRET_KEY", "")
ASSOCIATE_TAG = os.getenv("AMAZON_ASSOCIATE_TAG", "pignabot-21")
HOST = "webservices.amazon.it"
REGION = "eu-west-1"


def _sign(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode(), hashlib.sha256).digest()


def _signing_key(key: str, date_stamp: str) -> bytes:
    k = _sign(("AWS4" + key).encode(), date_stamp)
    k = _sign(k, REGION)
    k = _sign(k, "ProductAdvertisingAPI")
    return _sign(k, "aws4_request")


def _auth_headers(payload: str, target: str) -> dict:
    now = datetime.now(timezone.utc)
    amz_date  = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")
    ct = "application/json; charset=UTF-8"
    uri = "/paapi5/searchitems"

    h2sign = {
        "content-encoding": "amz-1.0",
        "content-type": ct,
        "host": HOST,
        "x-amz-date": amz_date,
        "x-amz-target": target,
    }
    signed = ";".join(sorted(h2sign))
    canon_h = "".join(f"{k}:{v}\n" for k, v in sorted(h2sign.items()))
    ph = hashlib.sha256(payload.encode()).hexdigest()
    canon = "\n".join(["POST", uri, "", canon_h, signed, ph])
    scope = f"{date_stamp}/{REGION}/ProductAdvertisingAPI/aws4_request"
    s2s = "\n".join(["AWS4-HMAC-SHA256", amz_date, scope,
                      hashlib.sha256(canon.encode()).hexdigest()])
    sig = hmac.new(_signing_key(SECRET_KEY, date_stamp),
                   s2s.encode(), hashlib.sha256).hexdigest()
    auth = (f"AWS4-HMAC-SHA256 Credential={ACCESS_KEY}/{scope}, "
            f"SignedHeaders={signed}, Signature={sig}")
    return {**h2sign, "Authorization": auth}


async def search_filaments(keyword: str, n: int = 3) -> list[dict]:
    """Cerca filamenti su Amazon IT e ritorna i migliori n risultati."""
    target = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems"
    payload = json.dumps({
        "PartnerTag": ASSOCIATE_TAG,
        "PartnerType": "Associates",
        "Keywords": keyword,
        "SearchIndex": "All",
        "ItemCount": 10,
        "Resources": [
            "Images.Primary.Large",
            "ItemInfo.Title",
            "Offers.Listings.Price",
        ],
        "Marketplace": "www.amazon.it",
    })
    headers = _auth_headers(payload, target)
    url = f"https://{HOST}/paapi5/searchitems"

    async with aiohttp.ClientSession() as sess:
        async with sess.post(url, headers=headers, data=payload,
                             timeout=aiohttp.ClientTimeout(total=15)) as resp:
            if resp.status != 200:
                txt = await resp.text()
                print(f"  [ERRORE {resp.status}] {txt[:300]}", file=sys.stderr)
                return []
            data = await resp.json()

    results = []
    for item in data.get("SearchResult", {}).get("Items", []):
        asin  = item.get("ASIN", "")
        title = item.get("ItemInfo", {}).get("Title", {}).get("DisplayValue", "")
        image = item.get("Images", {}).get("Primary", {}).get("Large", {}).get("URL", "")
        listings = item.get("Offers", {}).get("Listings", [])
        price = listings[0].get("Price", {}).get("Amount") if listings else None

        if not asin or not image:
            continue

        # Filtra risultati non pertinenti (nozzle, stampanti, accessori non filamenti)
        tl = title.lower()
        skip_words = ["nozzle", "ugello", "stampante", "printer", "hotend",
                      "extruder", "estrusore", "bed", "piatto", "glass"]
        if any(w in tl for w in skip_words):
            continue

        results.append({
            "asin": asin,
            "title": title,
            "image": image,
            "price": price,
            "link": f"https://amzn.to/{{SHORT}}",  # placeholder, accorcia manualmente
            "long_link": f"https://www.amazon.it/dp/{asin}?tag={ASSOCIATE_TAG}",
        })
        if len(results) >= n:
            break

    return results


# Mappa guida → query di ricerca
GUIDE_QUERIES = {
    "pla":          "filamento PLA 1kg stampa 3D FDM",
    "petg":         "filamento PETG 1kg stampa 3D FDM",
    "abs-asa":      "filamento ABS ASA 1kg stampa 3D",
    "tpu":          "filamento TPU flessibile 95A stampa 3D",
    "nylon-pa":     "filamento Nylon PA12 stampa 3D",
    "pla-cf":       "filamento fibra carbonio PLA CF stampa 3D",
}

GUIDE_TITLES = {
    "pla":      "Filamenti PLA consigliati",
    "petg":     "Filamenti PETG consigliati",
    "abs-asa":  "Filamenti ABS/ASA consigliati",
    "tpu":      "Filamenti TPU consigliati",
    "nylon-pa": "Filamenti Nylon consigliati",
    "pla-cf":   "Filamenti CF consigliati",
}


def ts_product(p: dict, idx: int) -> str:
    title = p["title"]
    short = title[:50] + "..." if len(title) > 50 else title
    brief = title[:24]
    return f"""      {{
        nome: "{short.replace('"', '\\"')}",
        nomeBrevissimo: "{brief.replace('"', '\\"')}",
        descrizione: "— aggiungi descrizione manuale —",
        asin: "{p['asin']}",
        imageUrl: "{p['image']}",
        affiliateLink: "{p['long_link']}",  // TODO: accorci con amzn.to
      }}"""


async def main():
    if not ACCESS_KEY or not SECRET_KEY:
        print("ERRORE: AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY non configurati.", file=sys.stderr)
        print(f"Cerca in: {BOT_ENV}", file=sys.stderr)
        sys.exit(1)

    print(f"Associate tag: {ASSOCIATE_TAG}\n")
    print("=" * 70)

    for slug, query in GUIDE_QUERIES.items():
        print(f"\n// ── {slug} ──────────────────────────────────────────────────────")
        print(f'//    Aggiungere in GUIDE (slug: "{slug}") → prodottiConsigliati:')
        print(f"//    Titolo sezione: \"{GUIDE_TITLES[slug]}\"")
        print(f"\n  prodottiConsigliati: [")

        print(f"  // Ricerca: {query!r}", file=sys.stderr)
        results = await search_filaments(query, n=3)
        await asyncio.sleep(1.1)  # rispetta rate limit PA-API (1 req/s)

        if not results:
            print("    // Nessun risultato — esegui manualmente")
        else:
            for i, p in enumerate(results):
                print(ts_product(p, i) + ("," if i < len(results) - 1 else ""))

        print("  ],")

    print("\n" + "=" * 70)
    print("\nNOTA: sostituisci i link lunghi con link amzn.to per brevità.")
    print("NOTA: rivedi nome/descrizione manualmente per ogni prodotto.")


if __name__ == "__main__":
    asyncio.run(main())
