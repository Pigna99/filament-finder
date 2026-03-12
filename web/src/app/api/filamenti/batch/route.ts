import { NextRequest, NextResponse } from "next/server";
import { getFilamentiByIds } from "@/lib/filamenti";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n) && n > 0)
    .slice(0, 4);

  if (ids.length === 0)
    return NextResponse.json([], { status: 200 });

  const rows = await getFilamentiByIds(ids);
  const json = JSON.stringify(rows, (_, v) =>
    typeof v === "bigint" ? Number(v) : v
  );
  return new NextResponse(json, {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
