import { NextRequest, NextResponse } from "next/server";
import { getCurators, updateCurator, IS_DEMO } from "@/db/data";

export const runtime = "nodejs";

export async function GET() {
  const curators = await getCurators();
  return NextResponse.json({ curators, demo: IS_DEMO });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json({ error: "Missing curator id" }, { status: 400 });
  }
  const patch: { name?: string; avatarUrl?: string | null } = {};
  if (typeof body.name === "string") patch.name = body.name.trim().slice(0, 40);
  if ("avatarUrl" in body) patch.avatarUrl = body.avatarUrl ?? null;

  const curator = await updateCurator(body.id, patch);
  return NextResponse.json({ curator, demo: IS_DEMO });
}
