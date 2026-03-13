"""
Script esplorativo: Impact.com API — deals, banner, promo codes per Elegoo.
Eseguire con: python -X utf8 scripts/explore_impact_promos.py
"""
import requests
import json
import sys

IMPACT_ACCOUNT_SID = "IRHNDhhP2yTL7008452LFap3vURNTnMpd1"
IMPACT_AUTH_TOKEN  = "yazHtGm~DFpEuTXjr9hEjm3egsh_qGMB"
IMPACT_API_BASE    = "https://api.impact.com"

session = requests.Session()
session.auth = (IMPACT_ACCOUNT_SID, IMPACT_AUTH_TOKEN)
session.headers.update({"Accept": "application/json"})


def call(path: str, params: dict = {}) -> dict:
    url = f"{IMPACT_API_BASE}/Mediapartners/{IMPACT_ACCOUNT_SID}{path}"
    r = session.get(url, params=params, timeout=30)
    print(f"  [{r.status_code}] GET {url}")
    if not r.ok:
        print(f"  ERROR: {r.text[:500]}")
        return {}
    return r.json()


def section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


# ── 1. Campaigns ─────────────────────────────────────────────────
section("1. CAMPAIGNS (per trovare CampaignId Elegoo)")
data = call("/Campaigns", {"PageSize": 50})
campaigns = data.get("Campaigns", [])
print(f"  Totale campagne: {len(campaigns)}")
for c in campaigns:
    print(f"  → [{c.get('Id')}] {c.get('Name')} | Advertiser: {c.get('AdvertiserName')} | Status: {c.get('Status')}")

# Trova campagna Elegoo
elegoo_campaign = next(
    (c for c in campaigns if "elegoo" in (c.get("AdvertiserName") or "").lower()),
    None
)
if not elegoo_campaign:
    print("  NESSUNA campagna Elegoo trovata.")
    sys.exit(1)

campaign_id = elegoo_campaign["Id"]
print(f"\n  >>> Campagna Elegoo: ID={campaign_id}, Nome={elegoo_campaign.get('Name')}")


# ── 2. Deals ─────────────────────────────────────────────────────
section(f"2. DEALS (CampaignId={campaign_id})")
data = call(f"/Campaigns/{campaign_id}/Deals", {"State": "ACTIVE", "PageSize": 50})
deals = data.get("Deals", [])
print(f"  Deals attivi: {len(deals)}")
for d in deals[:10]:
    print(json.dumps(d, indent=4, ensure_ascii=False))


# ── 3. Ads / Banner ──────────────────────────────────────────────
section(f"3. ADS/BANNER (CampaignId={campaign_id})")
data = call("/Ads", {"CampaignId": campaign_id, "Type": "BANNER", "PageSize": 50})
ads = data.get("Ads", [])
print(f"  Banner trovati: {len(ads)}")
for a in ads[:5]:
    print(f"  → [{a.get('Id')}] {a.get('Name')} | {a.get('Width')}x{a.get('Height')} | URL: {a.get('CreativeUrl', 'N/A')[:80]}")

# Anche TEXT_LINK
data2 = call("/Ads", {"CampaignId": campaign_id, "Type": "TEXT_LINK", "PageSize": 20})
links = data2.get("Ads", [])
print(f"  Text link trovati: {len(links)}")
for a in links[:5]:
    print(f"  → [{a.get('Id')}] {a.get('Name')} | Link: {a.get('TrackingLink', 'N/A')[:80]}")


# ── 4. Promo Codes ───────────────────────────────────────────────
section("4. PROMO CODES")
data = call("/PromoCodes", {"ProgramId": campaign_id, "PageSize": 50})
codes = data.get("PromoCodes", [])
print(f"  Promo codes trovati: {len(codes)}")
for p in codes[:10]:
    print(json.dumps(p, indent=4, ensure_ascii=False))


# ── 5. Raw dump primo deal ────────────────────────────────────────
if deals:
    section("5. RAW DUMP PRIMO DEAL")
    print(json.dumps(deals[0], indent=2, ensure_ascii=False))

if ads:
    section("6. RAW DUMP PRIMO BANNER")
    print(json.dumps(ads[0], indent=2, ensure_ascii=False))
