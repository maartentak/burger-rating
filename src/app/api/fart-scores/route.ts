import { NextRequest, NextResponse } from "next/server";
import { scoreFart, IS_DEMO } from "@/db/data";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json(
      { error: "Demo mode: connect a Neon database to score farts." },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body?.fartId || !body?.curatorId || typeof body.score !== "number") {
    return NextResponse.json({ error: "Missing fartId, curatorId or score" }, { status: 400 });
  }
  await scoreFart(String(body.fartId), String(body.curatorId), body.score);
  return NextResponse.json({ ok: true });
}
