import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;
function checkAuth(req: NextRequest) {
  return SECRET && req.nextUrl.searchParams.get("secret") === SECRET;
}
function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

// GET — lista stampanti
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const rows = await sql`
    SELECT * FROM printer_profile ORDER BY brand NULLS LAST, nome
  `;
  return NextResponse.json(rows);
}

// POST — crea stampante
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.nome || !b.diametro_mm)
    return NextResponse.json({ error: "nome e diametro_mm obbligatori" }, { status: 400 });
  const [row] = await sql`
    INSERT INTO printer_profile (nome, brand, diametro_mm, ha_enclosure, max_temp_hotend, max_temp_piatto, attivo)
    VALUES (
      ${b.nome}, ${b.brand ?? null}, ${b.diametro_mm},
      ${b.ha_enclosure ?? false},
      ${b.max_temp_hotend ?? null}, ${b.max_temp_piatto ?? null},
      ${b.attivo ?? true}
    ) RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

// PUT — aggiorna stampante
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  const [row] = await sql`
    UPDATE printer_profile SET
      nome            = ${b.nome},
      brand           = ${b.brand ?? null},
      diametro_mm     = ${b.diametro_mm},
      ha_enclosure    = ${b.ha_enclosure ?? false},
      max_temp_hotend = ${b.max_temp_hotend ?? null},
      max_temp_piatto = ${b.max_temp_piatto ?? null},
      attivo          = ${b.attivo ?? true}
    WHERE id = ${b.id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

// DELETE — elimina stampante
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  await sql`DELETE FROM printer_profile WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
