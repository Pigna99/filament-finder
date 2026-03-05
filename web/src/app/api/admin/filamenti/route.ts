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
    SELECT
      f.*,
      b.nome  AS brand_nome,
      ft.nome AS tipo_nome,
      fv.nome AS variante_nome
    FROM filament f
    JOIN brand            b  ON b.id  = f.id_brand
    JOIN filament_variant fv ON fv.id = f.id_variant
    JOIN filament_type    ft ON ft.id = fv.id_type
    ORDER BY b.nome, ft.nome, fv.nome, f.colore
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id_variant || !b.id_brand || !b.peso_g || !b.diametro_mm)
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  const [row] = await sql`
    INSERT INTO filament (
      id_variant, id_brand, sku, peso_g, diametro_mm,
      colore, colore_hex, colore_famiglia, link_immagine, link_brand,
      densita_g_cm3, humidity_sensitive
    ) VALUES (
      ${b.id_variant}, ${b.id_brand}, ${b.sku ?? null},
      ${b.peso_g}, ${b.diametro_mm},
      ${b.colore ?? null}, ${b.colore_hex ?? null}, ${b.colore_famiglia ?? null},
      ${b.link_immagine ?? null}, ${b.link_brand ?? null},
      ${b.densita_g_cm3 ?? null}, ${b.humidity_sensitive ?? false}
    ) RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  const [row] = await sql`
    UPDATE filament SET
      sku              = COALESCE(${b.sku ?? null}, sku),
      colore           = COALESCE(${b.colore ?? null}, colore),
      colore_hex       = COALESCE(${b.colore_hex ?? null}, colore_hex),
      colore_famiglia  = COALESCE(${b.colore_famiglia ?? null}, colore_famiglia),
      link_immagine    = COALESCE(${b.link_immagine ?? null}, link_immagine),
      link_brand       = COALESCE(${b.link_brand ?? null}, link_brand),
      densita_g_cm3    = COALESCE(${b.densita_g_cm3 ?? null}, densita_g_cm3),
      humidity_sensitive = COALESCE(${b.humidity_sensitive ?? null}, humidity_sensitive),
      attivo           = COALESCE(${b.attivo ?? null}, attivo),
      updated_at       = NOW()
    WHERE id = ${b.id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  await sql`DELETE FROM filament WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
