import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, PLACES_CONFIGURED } from "@/lib/places";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") ?? "");
  const coords =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
  try {
    const results = await searchPlaces(q, coords);
    return NextResponse.json({ results, configured: PLACES_CONFIGURED });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Place search failed. Check your Google Places API key.", results: [] },
      { status: 502 }
    );
  }
}
