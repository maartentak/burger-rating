import { NextRequest, NextResponse } from "next/server";
import { createEvaluation, IS_DEMO } from "@/db/data";

export const runtime = "nodejs";

const DIALS = [
  "patty",
  "bun",
  "cheese",
  "sauce",
  "build",
  "value",
  "overall",
  "ambiance",
  "lighting",
  "service",
  "comfort",
  "overallJoint",
  "hunger",
  "stress",
  "horny",
] as const;

const clampDial = (v: unknown) =>
  Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

export async function POST(req: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json(
      {
        error:
          "Demo mode: connect a Neon database (DATABASE_URL) to save evaluations.",
      },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body?.establishmentId || !body?.curatorId) {
    return NextResponse.json(
      { error: "Missing establishmentId or curatorId" },
      { status: 400 }
    );
  }

  const dials: Record<string, number> = {};
  for (const k of DIALS) dials[k] = clampDial(body[k]);

  const row = await createEvaluation({
    establishmentId: String(body.establishmentId),
    curatorId: String(body.curatorId),
    burgerName: String(body.name ?? body.burgerName ?? "").slice(0, 120),
    price: String(body.price ?? "").slice(0, 20),
    style: Array.isArray(body.style) ? body.style.slice(0, 6).map(String) : [],
    protein: body.protein ? String(body.protein) : null,
    again: typeof body.again === "boolean" ? body.again : null,
    beenHere: typeof body.beenHere === "boolean" ? body.beenHere : null,
    quote: String(body.quote ?? "").slice(0, 240),
    ...dials,
  });

  return NextResponse.json({ evaluation: row });
}
