import { NextRequest, NextResponse } from "next/server";
import { getCatalogo } from "@/lib/filamenti";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const rows = await getCatalogo({
    tipo: sp.get("tipo") ?? undefined,
    brand: sp.get("brand") ?? undefined,
    diametro: sp.get("diametro") ? Number(sp.get("diametro")) : undefined,
    colore_famiglia: sp.get("famiglia") ?? undefined,
    peso: sp.get("peso") ? Number(sp.get("peso")) : undefined,
    prezzo_max: sp.get("prezzo_max") ? Number(sp.get("prezzo_max")) : undefined,
    prezzo_abs_max: sp.get("maxeur") ? Number(sp.get("maxeur")) : undefined,
    disponibile: sp.get("disponibile") === "1" ? true : undefined,
    q: sp.get("q") ?? undefined,
    refill: (sp.get("refill") as "yes" | "no" | null) ?? undefined,
  });
  // Serialize BigInt fields to number for JSON
  const json = JSON.stringify(rows, (_, v) =>
    typeof v === "bigint" ? Number(v) : v
  );
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "s-maxage=300, stale-while-revalidate",
    },
  });
}
