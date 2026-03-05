import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;
function checkAuth(req: NextRequest) {
  return SECRET && req.nextUrl.searchParams.get("secret") === SECRET;
}
function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

// ── SHOP CRUD ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const mode = req.nextUrl.searchParams.get("mode") ?? "shop";

  if (mode === "links") {
    // Restituisce filament_shop con info aggregate
    const rows = await sql`
      SELECT
        fs.*,
        b.nome  AS brand_nome,
        ft.nome AS tipo_nome,
        fv.nome AS variante_nome,
        f.colore, f.peso_g, f.diametro_mm,
        s.nome  AS shop_nome
      FROM filament_shop fs
      JOIN filament         f  ON f.id  = fs.id_filament
      JOIN brand            b  ON b.id  = f.id_brand
      JOIN filament_variant fv ON fv.id = f.id_variant
      JOIN filament_type    ft ON ft.id = fv.id_type
      JOIN shop             s  ON s.id  = fs.id_shop
      ORDER BY b.nome, ft.nome, s.nome
    `;
    return NextResponse.json(rows);
  }

  const rows = await sql`SELECT * FROM shop ORDER BY nome`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();

  if (b.mode === "link") {
    // Crea filament_shop
    if (!b.id_filament || !b.id_shop || !b.link)
      return NextResponse.json({ error: "id_filament, id_shop, link obbligatori" }, { status: 400 });
    const [row] = await sql`
      INSERT INTO filament_shop (id_filament, id_shop, link, affiliazione, codice_sconto)
      VALUES (${b.id_filament}, ${b.id_shop}, ${b.link}, ${b.affiliazione ?? false}, ${b.codice_sconto ?? null})
      RETURNING *
    `;
    return NextResponse.json(row, { status: 201 });
  }

  // Crea shop
  if (!b.nome) return NextResponse.json({ error: "nome obbligatorio" }, { status: 400 });
  const [row] = await sql`
    INSERT INTO shop (nome, url, paese, tipo, codice_sconto)
    VALUES (${b.nome}, ${b.url ?? null}, ${b.paese ?? null}, ${b.tipo ?? null}, ${b.codice_sconto ?? null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });

  if (b.mode === "link") {
    const [row] = await sql`
      UPDATE filament_shop SET
        link          = COALESCE(${b.link ?? null}, link),
        affiliazione  = COALESCE(${b.affiliazione ?? null}, affiliazione),
        codice_sconto = COALESCE(${b.codice_sconto ?? null}, codice_sconto),
        attivo        = COALESCE(${b.attivo ?? null}, attivo)
      WHERE id = ${b.id}
      RETURNING *
    `;
    return NextResponse.json(row);
  }

  const [row] = await sql`
    UPDATE shop SET
      nome          = COALESCE(${b.nome ?? null}, nome),
      url           = COALESCE(${b.url ?? null}, url),
      paese         = COALESCE(${b.paese ?? null}, paese),
      tipo          = COALESCE(${b.tipo ?? null}, tipo),
      codice_sconto = COALESCE(${b.codice_sconto ?? null}, codice_sconto),
      attivo        = COALESCE(${b.attivo ?? null}, attivo)
    WHERE id = ${b.id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  const mode = req.nextUrl.searchParams.get("mode") ?? "shop";
  if (!id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });

  if (mode === "link") {
    await sql`DELETE FROM filament_shop WHERE id = ${id}`;
  } else {
    await sql`DELETE FROM shop WHERE id = ${id}`;
  }
  return NextResponse.json({ ok: true });
}
