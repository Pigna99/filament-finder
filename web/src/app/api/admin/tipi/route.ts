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
  const rows = await sql`SELECT * FROM filament_type ORDER BY nome`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.nome) return NextResponse.json({ error: "nome obbligatorio" }, { status: 400 });
  const [row] = await sql`
    INSERT INTO filament_type (
      nome, descrizione, flessibile, igroscopico, difficolta_stampa,
      temp_stampa_min, temp_stampa_max, temp_piatto_min, temp_piatto_max,
      richiede_enclosure, food_safe
    ) VALUES (
      ${b.nome}, ${b.descrizione ?? null},
      ${b.flessibile ?? false}, ${b.igroscopico ?? false},
      ${b.difficolta_stampa ?? null},
      ${b.temp_stampa_min ?? null}, ${b.temp_stampa_max ?? null},
      ${b.temp_piatto_min ?? null}, ${b.temp_piatto_max ?? null},
      ${b.richiede_enclosure ?? false}, ${b.food_safe ?? false}
    ) RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  const [row] = await sql`
    UPDATE filament_type SET
      nome               = COALESCE(${b.nome ?? null}, nome),
      descrizione        = COALESCE(${b.descrizione ?? null}, descrizione),
      flessibile         = COALESCE(${b.flessibile ?? null}, flessibile),
      igroscopico        = COALESCE(${b.igroscopico ?? null}, igroscopico),
      difficolta_stampa  = COALESCE(${b.difficolta_stampa ?? null}, difficolta_stampa),
      temp_stampa_min    = COALESCE(${b.temp_stampa_min ?? null}, temp_stampa_min),
      temp_stampa_max    = COALESCE(${b.temp_stampa_max ?? null}, temp_stampa_max),
      temp_piatto_min    = COALESCE(${b.temp_piatto_min ?? null}, temp_piatto_min),
      temp_piatto_max    = COALESCE(${b.temp_piatto_max ?? null}, temp_piatto_max),
      richiede_enclosure = COALESCE(${b.richiede_enclosure ?? null}, richiede_enclosure),
      food_safe          = COALESCE(${b.food_safe ?? null}, food_safe)
    WHERE id = ${b.id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  await sql`DELETE FROM filament_type WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
