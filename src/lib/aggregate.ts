import type { EstablishmentRow, EvaluationRow } from "@/db/schema";
import { DEFAULT_CURATORS, type Curator, type CuratorId } from "./curators";
import {
  burgerComponentMean,
  jointComponentMean,
  mean,
  round,
  tier,
} from "./scoring";

export interface CuratorTake {
  curatorId: string;
  name: string;
  color: string;
  score: number; // gut burger overall
  jointScore: number;
  burgerName: string;
  quote: string;
}

export interface BurgerEntry {
  name: string;
  orderedBy: string; // curator name
  curatorId: string;
  score: number;
  style: string[];
  protein: string | null;
  price: string;
}

export interface Disagreement {
  key: string;
  label: string;
  spread: number;
  low: { curatorId: string; name: string; score: number };
  high: { curatorId: string; name: string; score: number };
}

export interface EstablishmentSummary {
  id: string;
  name: string;
  area: string;
  address: string;
  photoUrl: string | null;
  when: string;
  pickedBy: string | null;
  burgerScore: number;
  jointScore: number;
  total: number;
  evaluationCount: number;
}

export interface EstablishmentDetail extends EstablishmentSummary {
  burgers: BurgerEntry[];
  jointBars: { label: string; value: number }[];
  curatorTakes: CuratorTake[];
  disagreements: Disagreement[];
  biggestDisagreement: Disagreement | null;
}

function curatorName(id: string, curators: Curator[]): Curator {
  return (
    curators.find((c) => c.id === id) ??
    DEFAULT_CURATORS.find((c) => c.id === id) ?? {
      id: id as CuratorId,
      name: id,
      initial: id.charAt(0).toUpperCase(),
      color: "#F48FBB",
    }
  );
}

/** Chronological sort key for "Mon YYYY". */
export function monthOrder(when: string): number {
  const d = new Date(`${when.replace(/(\w+)\s+(\d+)/, "$1 1, $2")}`);
  const t = d.getTime();
  return Number.isNaN(t) ? 0 : t;
}

const DISAGREEMENT_DIMS: { key: keyof EvaluationRow; label: string }[] = [
  { key: "overall", label: "Overall burger" },
  { key: "patty", label: "The patty" },
  { key: "bun", label: "The bun" },
  { key: "cheese", label: "Cheese & toppings" },
  { key: "sauce", label: "Sauce & seasoning" },
  { key: "build", label: "Build & balance" },
  { key: "value", label: "Value" },
  { key: "ambiance", label: "Ambiance" },
  { key: "lighting", label: "Lighting" },
  { key: "service", label: "Service" },
  { key: "comfort", label: "Comfort" },
  { key: "overallJoint", label: "Overall joint" },
];

function disagreementsFor(
  evals: EvaluationRow[],
  curators: Curator[]
): Disagreement[] {
  if (evals.length < 2) return [];
  const out: Disagreement[] = [];
  for (const dim of DISAGREEMENT_DIMS) {
    const vals = evals.map((e) => ({
      curatorId: e.curatorId,
      score: e[dim.key] as number,
    }));
    let lo = vals[0];
    let hi = vals[0];
    for (const v of vals) {
      if (v.score < lo.score) lo = v;
      if (v.score > hi.score) hi = v;
    }
    const spread = hi.score - lo.score;
    if (spread <= 0) continue;
    out.push({
      key: dim.key as string,
      label: dim.label,
      spread,
      low: { ...lo, name: curatorName(lo.curatorId, curators).name },
      high: { ...hi, name: curatorName(hi.curatorId, curators).name },
    });
  }
  return out.sort((a, b) => b.spread - a.spread);
}

export function summarize(
  est: EstablishmentRow,
  evals: EvaluationRow[]
): EstablishmentSummary {
  const burgerScore = round(mean(evals.map((e) => e.overall)));
  const jointScore = round(mean(evals.map((e) => e.overallJoint)));
  const total = evals.length
    ? round(burgerScore * 0.7 + jointScore * 0.3)
    : 0;
  return {
    id: est.id,
    name: est.name,
    area: est.area,
    address: est.address,
    photoUrl: est.photoUrl,
    when: est.visitedMonth,
    pickedBy: est.pickedBy,
    burgerScore,
    jointScore,
    total,
    evaluationCount: evals.length,
  };
}

export function detail(
  est: EstablishmentRow,
  evals: EvaluationRow[],
  curators: Curator[]
): EstablishmentDetail {
  const base = summarize(est, evals);
  const burgers: BurgerEntry[] = evals.map((e) => ({
    name: e.burgerName || "Unnamed burger",
    orderedBy: curatorName(e.curatorId, curators).name,
    curatorId: e.curatorId,
    score: e.overall,
    style: e.style ?? [],
    protein: e.protein,
    price: e.price,
  }));
  const jointBars = [
    { label: "Ambiance", value: round(mean(evals.map((e) => e.ambiance))) },
    { label: "Lighting", value: round(mean(evals.map((e) => e.lighting))) },
    { label: "Service", value: round(mean(evals.map((e) => e.service))) },
    { label: "Comfort", value: round(mean(evals.map((e) => e.comfort))) },
  ];
  const curatorTakes: CuratorTake[] = evals.map((e) => {
    const c = curatorName(e.curatorId, curators);
    return {
      curatorId: e.curatorId,
      name: c.name,
      color: c.color,
      score: e.overall,
      jointScore: e.overallJoint,
      burgerName: e.burgerName,
      quote: e.quote,
    };
  });
  const disagreements = disagreementsFor(evals, curators);
  return {
    ...base,
    burgers,
    jointBars,
    curatorTakes,
    disagreements,
    biggestDisagreement: disagreements[0] ?? null,
  };
}

export { burgerComponentMean, jointComponentMean, tier };
