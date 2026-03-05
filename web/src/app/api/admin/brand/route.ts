import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;

function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

function checkAuth(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  return SECRET && secret === SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const rows = await sql`SELECT * FROM brand ORDER BY nome`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const { nome, url, logo } = await req.json();
  if (!nome) return NextResponse.json({ error: "nome obbligatorio" }, { status: 400 });
  const [row] = await sql`
    INSERT INTO brand (nome, url, logo) VALUES (${nome}, ${url ?? null}, ${logo ?? null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const { id, nome, url, logo, attivo } = await req.json();
  if (!id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  const [row] = await sql`
    UPDATE brand SET
      nome   = COALESCE(${nome ?? null}, nome),
      url    = COALESCE(${url ?? null}, url),
      logo   = COALESCE(${logo ?? null}, logo),
      attivo = COALESCE(${attivo ?? null}, attivo)
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
  await sql`DELETE FROM brand WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
