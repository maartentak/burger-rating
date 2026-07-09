import { NextRequest, NextResponse } from "next/server";
import { createEstablishment, listSummaries, IS_DEMO } from "@/db/data";

export const runtime = "nodejs";

export async function GET() {
  const establishments = await listSummaries();
  return NextResponse.json({ establishments, demo: IS_DEMO });
}

export async function POST(req: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json(
      {
        error:
          "Demo mode: connect a Neon database (DATABASE_URL) to save new joints.",
      },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  const est = await createEstablishment({
    googlePlaceId: body.googlePlaceId ?? null,
    name: String(body.name).slice(0, 120),
    area: body.area ?? "",
    address: body.address ?? "",
    photoUrl: body.photoName ? `/api/places/photo?name=${encodeURIComponent(body.photoName)}` : body.photoUrl ?? null,
    lat: body.lat ?? null,
    lng: body.lng ?? null,
    pickedBy: body.pickedBy ?? null,
    visitedMonth: body.visitedMonth,
  });
  return NextResponse.json({ establishment: est });
}
