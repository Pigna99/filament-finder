import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;
function checkAuth(req: NextRequest) {
  return SECRET && req.nextUrl.searchParams.get("secret") === SECRET;
}
function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const rows = await sql`
    SELECT fv.*, ft.nome AS tipo_nome
    FROM filament_variant fv
    JOIN filament_type ft ON ft.id = fv.id_type
    ORDER BY ft.nome, fv.nome
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id_type || !b.nome)
    return NextResponse.json({ error: "id_type e nome obbligatori" }, { status: 400 });
  const [row] = await sql`
    INSERT INTO filament_variant (
      id_type, nome, descrizione, flessibile, igroscopico, difficolta_stampa,
      temp_stampa_min, temp_stampa_max, temp_piatto_min, temp_piatto_max,
      richiede_enclosure, food_safe
    ) VALUES (
      ${b.id_type}, ${b.nome}, ${b.descrizione ?? null},
      ${b.flessibile ?? null}, ${b.igroscopico ?? null},
      ${b.difficolta_stampa ?? null},
      ${b.temp_stampa_min ?? null}, ${b.temp_stampa_max ?? null},
      ${b.temp_piatto_min ?? null}, ${b.temp_piatto_max ?? null},
      ${b.richiede_enclosure ?? null}, ${b.food_safe ?? null}
    ) RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  const [row] = await sql`
    UPDATE filament_variant SET
      nome               = COALESCE(${b.nome ?? null}, nome),
      descrizione        = COALESCE(${b.descrizione ?? null}, descrizione),
      flessibile         = ${b.flessibile ?? null},
      igroscopico        = ${b.igroscopico ?? null},
      difficolta_stampa  = ${b.difficolta_stampa ?? null},
      temp_stampa_min    = ${b.temp_stampa_min ?? null},
      temp_stampa_max    = ${b.temp_stampa_max ?? null},
      temp_piatto_min    = ${b.temp_piatto_min ?? null},
      temp_piatto_max    = ${b.temp_piatto_max ?? null},
      richiede_enclosure = ${b.richiede_enclosure ?? null},
      food_safe          = ${b.food_safe ?? null}
    WHERE id = ${b.id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  await sql`DELETE FROM filament_variant WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
