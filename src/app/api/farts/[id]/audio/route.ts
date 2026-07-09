import { NextRequest, NextResponse } from "next/server";
import { getFartAudio } from "@/db/data";

export const runtime = "nodejs";

/** Streams a fart's audio (decoded from its stored data URL). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dataUrl = await getFartAudio(id);
  if (!dataUrl) return new NextResponse("Not found", { status: 404 });

  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) return new NextResponse("Bad audio", { status: 500 });
  const [, type, b64] = match;
  const buf = Buffer.from(b64, "base64");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
