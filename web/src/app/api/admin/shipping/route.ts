import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;
function checkAuth(req: NextRequest) {
  return SECRET && req.nextUrl.searchParams.get("secret") === SECRET;
}
function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

// GET: lista tutte le regole con nome shop
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const rows = await sql`
    SELECT ss.*, s.nome AS shop_nome
    FROM shop_shipping ss
    JOIN shop s ON s.id = ss.id_shop
    ORDER BY s.nome
  `;
  return NextResponse.json(rows);
}

// POST: crea/aggiorna regola per uno shop (upsert)
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  const { id_shop, costo, soglia_gratis, corriere, giorni_min, giorni_max, note } = b;
  if (!id_shop) return NextResponse.json({ error: "id_shop obbligatorio" }, { status: 400 });

  const [row] = await sql`
    INSERT INTO shop_shipping (id_shop, costo, soglia_gratis, corriere, giorni_min, giorni_max, note)
    VALUES (
      ${id_shop},
      ${costo ?? 0},
      ${soglia_gratis ?? null},
      ${corriere || null},
      ${giorni_min ?? null},
      ${giorni_max ?? null},
      ${note || null}
    )
    ON CONFLICT (id_shop) DO UPDATE SET
      costo         = EXCLUDED.costo,
      soglia_gratis = EXCLUDED.soglia_gratis,
      corriere      = EXCLUDED.corriere,
      giorni_min    = EXCLUDED.giorni_min,
      giorni_max    = EXCLUDED.giorni_max,
      note          = EXCLUDED.note
    RETURNING *
  `;
  return NextResponse.json(row);
}

// DELETE: rimuovi regola
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });
  await sql`DELETE FROM shop_shipping WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
