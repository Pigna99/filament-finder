import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;
function checkAuth(req: NextRequest) {
  return SECRET && req.nextUrl.searchParams.get("secret") === SECRET;
}
function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

// GET — compatibilità per una variante (?id_variant=N)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id_variant = req.nextUrl.searchParams.get("id_variant");
  if (!id_variant) return NextResponse.json({ error: "id_variant obbligatorio" }, { status: 400 });
  const rows = await sql`
    SELECT fvp.*, pp.nome, pp.brand, pp.diametro_mm, pp.ha_enclosure, pp.max_temp_hotend
    FROM filament_variant_printer fvp
    JOIN printer_profile pp ON pp.id = fvp.id_printer
    WHERE fvp.id_variant = ${id_variant}
    ORDER BY pp.brand NULLS LAST, pp.nome
  `;
  return NextResponse.json(rows);
}

// PUT — imposta compatibilità (upsert)
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const b = await req.json();
  if (!b.id_variant || !b.id_printer)
    return NextResponse.json({ error: "id_variant e id_printer obbligatori" }, { status: 400 });
  await sql`
    INSERT INTO filament_variant_printer (id_variant, id_printer, compatibile, note)
    VALUES (${b.id_variant}, ${b.id_printer}, ${b.compatibile ?? true}, ${b.note ?? null})
    ON CONFLICT (id_variant, id_printer) DO UPDATE SET
      compatibile = EXCLUDED.compatibile,
      note        = EXCLUDED.note
  `;
  return NextResponse.json({ ok: true });
}

// DELETE — rimuove compatibilità (?id_variant=N&id_printer=M)
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id_variant = req.nextUrl.searchParams.get("id_variant");
  const id_printer = req.nextUrl.searchParams.get("id_printer");
  if (!id_variant || !id_printer)
    return NextResponse.json({ error: "id_variant e id_printer obbligatori" }, { status: 400 });
  await sql`
    DELETE FROM filament_variant_printer
    WHERE id_variant = ${id_variant} AND id_printer = ${id_printer}
  `;
  return NextResponse.json({ ok: true });
}
