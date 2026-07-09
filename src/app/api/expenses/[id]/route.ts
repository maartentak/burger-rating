import { NextRequest, NextResponse } from "next/server";
import { deleteExpense, IS_DEMO } from "@/db/data";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Demo mode." }, { status: 503 });
  }
  const { id } = await params;
  const ok = await deleteExpense(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
