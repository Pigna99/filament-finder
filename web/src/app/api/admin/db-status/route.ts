import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SECRET = process.env.ADMIN_SECRET;
function checkAuth(req: NextRequest) {
  return SECRET && req.nextUrl.searchParams.get("secret") === SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const tables = [
    "brand",
    "filament_type",
    "filament_variant",
    "filament",
    "tag",
    "filament_tag",
    "printer_profile",
    "filament_variant_printer",
    "shop",
    "filament_shop",
    "price_history",
  ];

  const counts: Record<string, number> = {};
  for (const t of tables) {
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM ${sql(t)}`;
    counts[t] = count;
  }

  return NextResponse.json({ counts });
}
