import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;
function checkAuth(req: NextRequest) {
  return SECRET && req.nextUrl.searchParams.get("secret") === SECRET;
}
function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

// GET — restituisce gli ultimi prezzi per un filament_shop (o tutti i link di un filamento)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id_filament = req.nextUrl.searchParams.get("id_filament");
  const id_filament_shop = req.nextUrl.searchParams.get("id_filament_shop");

  if (id_filament_shop) {
    const rows = await sql`
      SELECT * FROM price_history
      WHERE id_filament_shop = ${id_filament_shop}
      ORDER BY rilevato_at DESC
      LIMIT 50
    `;
    return NextResponse.json(rows);
  }

  if (id_filament) {
    // Tutti i link + ultimo prezzo per un filamento
    const rows = await sql`
      SELECT fs.id, fs.id_shop, s.nome AS shop_nome, fs.link, fs.attivo,
             ph.prezzo, ph.prezzo_scontato, ph.disponibile, ph.rilevato_at
      FROM filament_shop fs
      JOIN shop s ON s.id = fs.id_shop
      LEFT JOIN LATERAL (
        SELECT * FROM price_history WHERE id_filament_shop = fs.id
        ORDER BY rilevato_at DESC LIMIT 1
      ) ph ON TRUE
      WHERE fs.id_filament = ${id_filament}
      ORDER BY s.nome
    `;
    return NextResponse.json(rows);
  }

  return NextResponse.json({ error: "Specificare id_filament o id_filament_shop" }, { status: 400 });
}

// POST — inserisce un nuovo rilevamento prezzo
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id_filament_shop || b.prezzo == null)
    return NextResponse.json({ error: "id_filament_shop e prezzo obbligatori" }, { status: 400 });

  const [row] = await sql`
    INSERT INTO price_history (
      id_filament_shop, prezzo, prezzo_spedizione,
      sconto_percentuale, prezzo_scontato, disponibile
    ) VALUES (
      ${b.id_filament_shop},
      ${b.prezzo},
      ${b.prezzo_spedizione ?? 0},
      ${b.sconto_percentuale ?? null},
      ${b.prezzo_scontato ?? null},
      ${b.disponibile ?? true}
    ) RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
