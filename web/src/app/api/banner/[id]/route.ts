import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Cache immagine per 6 ore (= frequenza scraper promos)
export const revalidate = 21600;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Recupera URL banner dal DB
  const rows = await sql<{ banner_url: string }[]>`
    SELECT banner_url FROM elegoo_promo WHERE id = ${id} AND attivo = TRUE LIMIT 1
  `;
  const bannerUrl = rows[0]?.banner_url;
  if (!bannerUrl) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const res = await fetch(bannerUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FilamentFinder/1.0; +https://filamenti.offerteai.it)",
        "Accept": "image/*,*/*",
      },
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
