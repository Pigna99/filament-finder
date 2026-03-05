import { NextRequest, NextResponse } from "next/server";
import { getCatalogo } from "@/lib/filamenti";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const rows = await getCatalogo({
    tipo: sp.get("tipo") ?? undefined,
    brand: sp.get("brand") ?? undefined,
    diametro: sp.get("diametro") ? Number(sp.get("diametro")) : undefined,
    colore_famiglia: sp.get("famiglia") ?? undefined,
    prezzo_max: sp.get("prezzo_max") ? Number(sp.get("prezzo_max")) : undefined,
    q: sp.get("q") ?? undefined,
  });
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate" },
  });
}
