import { NextRequest, NextResponse } from "next/server";
import { deleteEstablishment, getEstablishmentDetail, IS_DEMO } from "@/db/data";

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
  return NextResponse.json({ establishment: detail, demo: IS_DEMO });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (IS_DEMO) {
    return NextResponse.json(
      { error: "Demo mode: connect a Neon database to delete joints." },
      { status: 503 }
    );
  }
  const { id } = await params;
  const ok = await deleteEstablishment(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
