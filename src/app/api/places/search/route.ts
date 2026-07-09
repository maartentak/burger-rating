import { NextRequest, NextResponse } from "next/server";
import { searchPlaces, PLACES_CONFIGURED } from "@/lib/places";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const results = await searchPlaces(q);
    return NextResponse.json({ results, configured: PLACES_CONFIGURED });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Place search failed. Check your Google Places API key.", results: [] },
      { status: 502 }
    );
  }
}
