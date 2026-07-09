import { NextResponse } from "next/server";
import { getDashboard } from "@/db/data";

export const runtime = "nodejs";

export async function GET() {
  const dashboard = await getDashboard();
  return NextResponse.json(dashboard);
}
