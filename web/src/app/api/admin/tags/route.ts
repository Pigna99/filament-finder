import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  return secret === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const filamentId = req.nextUrl.searchParams.get("filament_id");

  if (filamentId) {
    // Tags assigned to a specific filament
    const rows = await sql`
      SELECT t.id, t.nome, t.descrizione,
             (ft.id_tag IS NOT NULL) AS assegnato
      FROM tag t
      LEFT JOIN filament_tag ft ON ft.id_tag = t.id AND ft.id_filament = ${Number(filamentId)}
      ORDER BY t.nome
    `;
    return NextResponse.json(rows);
  }

  const rows = await sql`SELECT * FROM tag ORDER BY nome`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { nome, descrizione } = body;
  const [row] = await sql`
    INSERT INTO tag (nome, descrizione) VALUES (${nome}, ${descrizione ?? null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, nome, descrizione } = body;
  const [row] = await sql`
    UPDATE tag SET nome = ${nome}, descrizione = ${descrizione ?? null}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  await sql`DELETE FROM tag WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
