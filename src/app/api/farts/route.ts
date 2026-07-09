import { NextRequest, NextResponse } from "next/server";
import { createFart, listFarts, IS_DEMO } from "@/db/data";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const establishmentId = req.nextUrl.searchParams.get("establishmentId") ?? undefined;
  const farts = await listFarts(establishmentId || undefined);
  return NextResponse.json({ farts, demo: IS_DEMO });
}

export async function POST(req: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json(
      { error: "Demo mode: connect a Neon database to save farts." },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body?.curatorId || !body?.audio) {
    return NextResponse.json({ error: "Missing curatorId or audio" }, { status: 400 });
  }
  if (typeof body.audio !== "string" || !body.audio.startsWith("data:audio")) {
    return NextResponse.json({ error: "Invalid audio" }, { status: 400 });
  }
  // ~4 MB cap on the data URL to stay under serverless limits.
  if (body.audio.length > 4_000_000) {
    return NextResponse.json({ error: "Recording too long — keep it under ~20s." }, { status: 413 });
  }
  const fart = await createFart({
    curatorId: String(body.curatorId),
    establishmentId: body.establishmentId ?? null,
    name: body.name ? String(body.name) : "",
    audio: body.audio,
  });
  return NextResponse.json({ fart });
}
