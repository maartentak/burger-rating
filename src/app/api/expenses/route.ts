import { NextRequest, NextResponse } from "next/server";
import { createExpense, getSplitSummary, IS_DEMO } from "@/db/data";
import { CURATOR_IDS } from "@/lib/curators";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const establishmentId =
    req.nextUrl.searchParams.get("establishmentId") ?? undefined;
  const summary = await getSplitSummary(establishmentId || undefined);
  return NextResponse.json(summary);
}

export async function POST(req: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json(
      { error: "Demo mode: connect a Neon database to track bills." },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => null);
  const validIds = new Set<string>(CURATOR_IDS);

  if (!body?.paidBy || !validIds.has(String(body.paidBy))) {
    return NextResponse.json({ error: "Missing or unknown payer" }, { status: 400 });
  }
  const amountCents = Math.round(Number(body.amountCents));
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
  }
  const rawParticipants: unknown[] = Array.isArray(body.participants)
    ? body.participants
    : [];
  const participants: string[] = [
    ...new Set(rawParticipants.map((p) => String(p))),
  ].filter((p) => validIds.has(p));
  if (participants.length === 0) {
    return NextResponse.json({ error: "Pick at least one person to split with" }, { status: 400 });
  }

  const expense = await createExpense({
    paidBy: String(body.paidBy),
    amountCents,
    participants,
    description: body.description ? String(body.description) : "",
    establishmentId: body.establishmentId ?? null,
  });
  return NextResponse.json({ expense });
}
