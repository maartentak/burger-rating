import { NextRequest, NextResponse } from "next/server";
import { deleteEvaluation, IS_DEMO } from "@/db/data";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (IS_DEMO) {
    return NextResponse.json(
      { error: "Demo mode: connect a Neon database to remove reviews." },
      { status: 503 }
    );
  }
  const { id } = await params;
  const ok = await deleteEvaluation(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
