import { NextRequest, NextResponse } from "next/server";
import { getEstablishmentDetail } from "@/db/data";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detail = await getEstablishmentDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ establishment: detail });
}
