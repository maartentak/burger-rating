import { NextRequest, NextResponse } from "next/server";
import { fetchPlacePhoto } from "@/lib/places";

export const runtime = "nodejs";

/** Proxies a Google Places photo so the API key never reaches the browser. */
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return new NextResponse("Missing photo name", { status: 400 });

  const res = await fetchPlacePhoto(name);
  if (!res) return new NextResponse("No photo", { status: 404 });

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
