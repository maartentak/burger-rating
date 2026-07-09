import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "./client";
import {
  curators as curatorsTable,
  establishments,
  evaluations,
  farts,
  fartScores,
} from "./schema";
import type { EstablishmentRow, EvaluationRow } from "./schema";
import { buildDemoData } from "./demo";
import { DEFAULT_CURATORS, type Curator } from "@/lib/curators";
import {
  detail,
  monthOrder,
  summarize,
  type Disagreement,
  type EstablishmentDetail,
  type EstablishmentSummary,
} from "@/lib/aggregate";
import { mean, round } from "@/lib/scoring";

/** Whether the app is running on seeded demo data (no DB configured). */
export const IS_DEMO = !isDbConfigured;

async function loadRaw(): Promise<{
  establishments: EstablishmentRow[];
  evaluations: EvaluationRow[];
}> {
  if (!isDbConfigured) return buildDemoData();
  const db = getDb();
  const [ests, evals] = await Promise.all([
    db.select().from(establishments),
    db.select().from(evaluations),
  ]);
  return { establishments: ests, evaluations: evals };
}

export async function getCurators(): Promise<Curator[]> {
  if (!isDbConfigured) return DEFAULT_CURATORS;
  const db = getDb();
  const rows = await db.select().from(curatorsTable);
  if (rows.length === 0) return DEFAULT_CURATORS;
  return DEFAULT_CURATORS.map((d) => {
    const r = rows.find((x) => x.id === d.id);
    // Fall back to the drop-in /avatars/{id}.png default when no upload is set.
    return r
      ? { ...d, name: r.name, color: r.color, avatarUrl: r.avatarUrl ?? d.avatarUrl }
      : d;
  });
}

export async function updateCurator(
  id: string,
  patch: { name?: string; avatarUrl?: string | null }
): Promise<Curator> {
  if (!isDbConfigured) {
    // Demo mode: nothing persists, echo back the merged value.
    const base = DEFAULT_CURATORS.find((c) => c.id === id)!;
    return { ...base, ...patch };
  }
  const db = getDb();
  const base = DEFAULT_CURATORS.find((c) => c.id === id);
  if (!base) throw new Error("Unknown curator");
  await db
    .insert(curatorsTable)
    .values({
      id,
      name: patch.name ?? base.name,
      color: base.color,
      avatarUrl: patch.avatarUrl ?? null,
    })
    .onConflictDoUpdate({
      target: curatorsTable.id,
      set: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.avatarUrl !== undefined
          ? { avatarUrl: patch.avatarUrl }
          : {}),
      },
    });
  const curators = await getCurators();
  return curators.find((c) => c.id === id)!;
}

export async function createEstablishment(input: {
  googlePlaceId?: string | null;
  name: string;
  area?: string;
  address?: string;
  photoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  pickedBy?: string | null;
  visitedMonth?: string;
}): Promise<EstablishmentRow> {
  const db = getDb();
  const [row] = await db
    .insert(establishments)
    .values({
      googlePlaceId: input.googlePlaceId ?? null,
      name: input.name,
      area: input.area ?? "",
      address: input.address ?? "",
      photoUrl: input.photoUrl ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      pickedBy: input.pickedBy ?? null,
      visitedMonth: input.visitedMonth ?? currentMonthLabel(),
    })
    .returning();
  return row;
}

export async function createEvaluation(
  input: Partial<EvaluationRow> & { establishmentId: string; curatorId: string }
): Promise<EvaluationRow> {
  const db = getDb();
  const [row] = await db.insert(evaluations).values(input).returning();
  return row;
}

export async function deleteEvaluation(id: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(evaluations)
    .where(eq(evaluations.id, id))
    .returning({ id: evaluations.id });
  return rows.length > 0;
}

/** Deletes a whole joint and its reviews (evaluations cascade via FK). */
export async function deleteEstablishment(id: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(establishments)
    .where(eq(establishments.id, id))
    .returning({ id: establishments.id });
  return rows.length > 0;
}

// ---------------- Farts 💨 ----------------

export interface FartView {
  id: string;
  name: string;
  curatorId: string;
  curatorName: string;
  color: string;
  establishmentId: string | null;
  establishmentName: string | null;
  avgScore: number | null;
  scoreCount: number;
  scores: { curatorId: string; score: number }[];
  createdAt: string;
}

export async function createFart(input: {
  curatorId: string;
  establishmentId?: string | null;
  name?: string;
  audio: string;
}) {
  const db = getDb();
  const [row] = await db
    .insert(farts)
    .values({
      curatorId: input.curatorId,
      establishmentId: input.establishmentId ?? null,
      name: (input.name ?? "").slice(0, 80),
      audio: input.audio,
    })
    .returning({ id: farts.id });
  return row;
}

export async function listFarts(establishmentId?: string): Promise<FartView[]> {
  if (!isDbConfigured) return [];
  const db = getDb();
  const cols = {
    id: farts.id,
    name: farts.name,
    curatorId: farts.curatorId,
    establishmentId: farts.establishmentId,
    createdAt: farts.createdAt,
  };
  const rows = establishmentId
    ? await db.select(cols).from(farts).where(eq(farts.establishmentId, establishmentId)).orderBy(desc(farts.createdAt))
    : await db.select(cols).from(farts).orderBy(desc(farts.createdAt));

  const [scoreRows, estRows, curators] = await Promise.all([
    db.select().from(fartScores),
    db.select({ id: establishments.id, name: establishments.name }).from(establishments),
    getCurators(),
  ]);
  const estName = (id: string | null) =>
    id ? estRows.find((e) => e.id === id)?.name ?? null : null;
  const cName = (id: string) => curators.find((c) => c.id === id)?.name ?? id;
  const cColor = (id: string) => curators.find((c) => c.id === id)?.color ?? "#F48FBB";

  const views: FartView[] = rows.map((f) => {
    const mine = scoreRows.filter((s) => s.fartId === f.id);
    const avg = mine.length ? round(mean(mine.map((s) => s.score))) : null;
    return {
      id: f.id,
      name: f.name || "Untitled toot",
      curatorId: f.curatorId,
      curatorName: cName(f.curatorId),
      color: cColor(f.curatorId),
      establishmentId: f.establishmentId,
      establishmentName: estName(f.establishmentId),
      avgScore: avg,
      scoreCount: mine.length,
      scores: mine.map((s) => ({ curatorId: s.curatorId, score: s.score })),
      createdAt: f.createdAt.toISOString(),
    };
  });

  // Ranked: highest average first, unscored last, newest as tiebreak.
  return views.sort((a, b) => {
    const av = a.avgScore ?? -1;
    const bv = b.avgScore ?? -1;
    if (bv !== av) return bv - av;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getFartAudio(id: string): Promise<string | null> {
  if (!isDbConfigured) return null;
  const db = getDb();
  const [row] = await db.select({ audio: farts.audio }).from(farts).where(eq(farts.id, id));
  return row?.audio ?? null;
}

export async function scoreFart(fartId: string, curatorId: string, score: number) {
  const db = getDb();
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const updated = await db
    .update(fartScores)
    .set({ score: clamped })
    .where(and(eq(fartScores.fartId, fartId), eq(fartScores.curatorId, curatorId)))
    .returning({ id: fartScores.id });
  if (updated.length === 0) {
    await db.insert(fartScores).values({ fartId, curatorId, score: clamped });
  }
}

export async function deleteFart(id: string): Promise<boolean> {
  const db = getDb();
  const rows = await db.delete(farts).where(eq(farts.id, id)).returning({ id: farts.id });
  return rows.length > 0;
}

export async function listSummaries(): Promise<EstablishmentSummary[]> {
  const { establishments: ests, evaluations: evals } = await loadRaw();
  return ests
    .map((e) => summarize(e, evals.filter((v) => v.establishmentId === e.id)))
    .sort((a, b) => b.total - a.total);
}

export async function getEstablishmentDetail(
  id: string
): Promise<EstablishmentDetail | null> {
  const { establishments: ests, evaluations: evals } = await loadRaw();
  const curators = await getCurators();
  const est = ests.find((e) => e.id === id);
  if (!est) return null;
  return detail(
    est,
    evals.filter((v) => v.establishmentId === id),
    curators
  );
}

export async function getRawEstablishment(
  id: string
): Promise<EstablishmentRow | null> {
  const { establishments: ests } = await loadRaw();
  return ests.find((e) => e.id === id) ?? null;
}

export interface Dashboard {
  podium: EstablishmentSummary[];
  ranked: EstablishmentSummary[];
  hallOfFame: {
    burgerName: string;
    establishmentName: string;
    curatorName: string;
    score: number;
  } | null;
  beef: {
    establishmentName: string;
    disagreement: Disagreement;
  } | null;
  clubAverage: {
    points: { when: string; value: number }[];
    delta: number;
  };
  insights: {
    favoriteProtein: { protein: string; avg: number; count: number } | null;
    curators: {
      curatorId: string;
      name: string;
      color: string;
      avgGiven: number;
      count: number;
    }[];
    generous: string | null;
    harsh: string | null;
    hungerNote: string | null;
  };
  joints: number;
  demo: boolean;
}

export async function getDashboard(): Promise<Dashboard> {
  const { establishments: ests, evaluations: evals } = await loadRaw();
  const curators = await getCurators();
  const nameOf = (id: string) =>
    curators.find((c) => c.id === id)?.name ?? id;

  const summaries = ests
    .map((e) => summarize(e, evals.filter((v) => v.establishmentId === e.id)))
    .filter((s) => s.evaluationCount > 0)
    .sort((a, b) => b.total - a.total);

  // Hall of fame — best single burger ever.
  let best: EvaluationRow | null = null;
  for (const e of evals) if (!best || e.overall > best.overall) best = e;
  const hallOfFame = best
    ? {
        burgerName: best.burgerName || "Unnamed burger",
        establishmentName:
          ests.find((x) => x.id === best!.establishmentId)?.name ?? "",
        curatorName: nameOf(best.curatorId),
        score: best.overall,
      }
    : null;

  // Beef of the month — biggest overall-burger spread at any one joint.
  let beef: Dashboard["beef"] = null;
  for (const est of ests) {
    const group = evals.filter((v) => v.establishmentId === est.id);
    // One voice per curator (average their burgers) so a beef is cross-curator.
    const curIds = [...new Set(group.map((g) => g.curatorId))];
    if (curIds.length < 2) continue;
    const perCurator = curIds.map((cid) => ({
      curatorId: cid,
      overall: round(
        mean(group.filter((g) => g.curatorId === cid).map((g) => g.overall))
      ),
    }));
    let lo = perCurator[0];
    let hi = perCurator[0];
    for (const g of perCurator) {
      if (g.overall < lo.overall) lo = g;
      if (g.overall > hi.overall) hi = g;
    }
    const spread = hi.overall - lo.overall;
    if (!beef || spread > beef.disagreement.spread) {
      beef = {
        establishmentName: est.name,
        disagreement: {
          key: "overall",
          label: "Overall burger",
          spread,
          low: { curatorId: lo.curatorId, name: nameOf(lo.curatorId), score: lo.overall },
          high: { curatorId: hi.curatorId, name: nameOf(hi.curatorId), score: hi.overall },
        },
      };
    }
  }

  // Club average sparkline — monthly average total, chronological.
  const byMonth = new Map<string, number[]>();
  for (const est of ests) {
    const s = summarize(
      est,
      evals.filter((v) => v.establishmentId === est.id)
    );
    if (s.evaluationCount === 0) continue;
    const arr = byMonth.get(est.visitedMonth) ?? [];
    arr.push(s.total);
    byMonth.set(est.visitedMonth, arr);
  }
  const points = [...byMonth.entries()]
    .map(([when, totals]) => ({ when, value: round(mean(totals)) }))
    .sort((a, b) => monthOrder(a.when) - monthOrder(b.when));
  const delta =
    points.length >= 2
      ? points[points.length - 1].value - points[points.length - 2].value
      : 0;

  // Insights.
  const proteinMap = new Map<string, number[]>();
  for (const e of evals) {
    if (!e.protein) continue;
    const arr = proteinMap.get(e.protein) ?? [];
    arr.push(e.overall);
    proteinMap.set(e.protein, arr);
  }
  let favoriteProtein: Dashboard["insights"]["favoriteProtein"] = null;
  for (const [protein, arr] of proteinMap) {
    const avg = round(mean(arr));
    if (!favoriteProtein || avg > favoriteProtein.avg) {
      favoriteProtein = { protein, avg, count: arr.length };
    }
  }

  const curatorStats = curators.map((c) => {
    const mine = evals.filter((e) => e.curatorId === c.id);
    return {
      curatorId: c.id,
      name: c.name,
      color: c.color,
      avgGiven: mine.length ? round(mean(mine.map((e) => e.overall))) : 0,
      count: mine.length,
    };
  });
  const rated = curatorStats.filter((c) => c.count > 0);
  const generous =
    rated.length > 1
      ? [...rated].sort((a, b) => b.avgGiven - a.avgGiven)[0].name
      : null;
  const harsh =
    rated.length > 1
      ? [...rated].sort((a, b) => a.avgGiven - b.avgGiven)[0].name
      : null;

  // Hunger bias — does a hungrier arrival track with a higher score?
  let hungerNote: string | null = null;
  if (evals.length >= 4) {
    const hungry = evals.filter((e) => e.hunger >= 60);
    const notHungry = evals.filter((e) => e.hunger < 60);
    if (hungry.length && notHungry.length) {
      const diff =
        round(mean(hungry.map((e) => e.overall))) -
        round(mean(notHungry.map((e) => e.overall)));
      if (Math.abs(diff) >= 3) {
        hungerNote =
          diff > 0
            ? `Hungry arrivals score ${diff} pts higher. The hangry bias is real.`
            : `Hungry arrivals score ${Math.abs(diff)} pts lower. Curious.`;
      }
    }
  }

  return {
    podium: summaries.slice(0, 3),
    ranked: summaries,
    hallOfFame,
    beef,
    clubAverage: { points, delta },
    insights: {
      favoriteProtein,
      curators: curatorStats,
      generous,
      harsh,
      hungerNote,
    },
    joints: summaries.length,
    demo: IS_DEMO,
  };
}

function currentMonthLabel(): string {
  return new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
}
