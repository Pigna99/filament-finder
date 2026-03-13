import type { MetadataRoute } from "next";
import { getCatalogo, getAllBrands, getAllTipi } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import { GUIDE } from "@/lib/guide";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "https://filamenti.offerteai.it";

  const [filamenti, brands, tipi] = await Promise.all([
    getCatalogo({}).catch(() => []),
    getAllBrands().catch(() => []),
    getAllTipi().catch(() => []),
  ]);

  const filamentiUrls = filamenti.map((f) => ({
    url: `${base}/filamento/${slugifyFilamento(f.brand, f.tipo, f.variante, f.colore ?? "", f.peso_g)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const guideUrls = GUIDE.map((g) => ({
    url: `${base}/guide/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const brandUrls = brands.map(b => ({
    url: `${base}/brand/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const tipoUrls = tipi.map(t => ({
    url: `${base}/tipo/${t.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/catalogo`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/guide`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    ...guideUrls,
    ...brandUrls,
    ...tipoUrls,
    ...filamentiUrls,
  ];
}
