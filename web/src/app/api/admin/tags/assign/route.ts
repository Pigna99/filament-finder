import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  return secret === process.env.ADMIN_SECRET;
}

// POST { id_filament, id_tag } → assign tag to filament
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id_filament, id_tag } = await req.json();
  await sql`
    INSERT INTO filament_tag (id_filament, id_tag) VALUES (${id_filament}, ${id_tag})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

// DELETE ?id_filament=X&id_tag=Y → remove tag from filament
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id_filament = req.nextUrl.searchParams.get("id_filament");
  const id_tag = req.nextUrl.searchParams.get("id_tag");
  await sql`DELETE FROM filament_tag WHERE id_filament = ${Number(id_filament)} AND id_tag = ${Number(id_tag)}`;
  return NextResponse.json({ ok: true });
}
