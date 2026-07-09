import type { EstablishmentRow, EvaluationRow } from "@/db/schema";
import { DEFAULT_CURATORS, type Curator, type CuratorId } from "./curators";
import {
  burgerComponentMean,
  evaluationTotal,
  jointComponentMean,
  mean,
  round,
  tier,
} from "./scoring";

/** One curator's take, rolled up across however many burgers they rated here. */
export interface CuratorTake {
  curatorId: string;
  name: string;
  color: string;
  score: number; // avg gut burger overall across their burgers
  jointScore: number; // avg gut joint
  quote: string;
  burgerCount: number;
  evaluationIds: string[];
}

export interface BurgerEntry {
  evaluationId: string;
  name: string;
  orderedBy: string; // curator name
  curatorId: string;
  score: number;
  style: string[];
  protein: string | null;
  price: string;
}

/** Full per-evaluation breakdown, used by the detail modal. */
export interface EvaluationView {
  id: string;
  curatorId: string;
  name: string; // curator name
  color: string;
  burgerName: string;
  price: string;
  style: string[];
  protein: string | null;
  again: boolean | null;
  beenHere: boolean | null;
  quote: string;
  total: number;
  burger: {
    patty: number;
    bun: number;
    cheese: number;
    sauce: number;
    build: number;
    value: number;
    overall: number;
  };
  joint: {
    ambiance: number;
    lighting: number;
    service: number;
    comfort: number;
    overallJoint: number;
  };
  bias: { hunger: number; stress: number; horny: number };
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
  evaluations: EvaluationView[];
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
  // Collapse to one value per curator per dimension so a curator who rated
  // multiple burgers is a single voice — disagreements are between curators.
  const curatorIds = [...new Set(evals.map((e) => e.curatorId))];
  if (curatorIds.length < 2) return [];
  const out: Disagreement[] = [];
  for (const dim of DISAGREEMENT_DIMS) {
    const vals = curatorIds.map((curatorId) => ({
      curatorId,
      score: round(
        mean(
          evals
            .filter((e) => e.curatorId === curatorId)
            .map((e) => e[dim.key] as number)
        )
      ),
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
    evaluationId: e.id,
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

  const evaluations: EvaluationView[] = evals.map((e) => {
    const c = curatorName(e.curatorId, curators);
    return {
      id: e.id,
      curatorId: e.curatorId,
      name: c.name,
      color: c.color,
      burgerName: e.burgerName || "Unnamed burger",
      price: e.price,
      style: e.style ?? [],
      protein: e.protein,
      again: e.again,
      beenHere: e.beenHere,
      quote: e.quote,
      total: evaluationTotal(e),
      burger: {
        patty: e.patty, bun: e.bun, cheese: e.cheese, sauce: e.sauce,
        build: e.build, value: e.value, overall: e.overall,
      },
      joint: {
        ambiance: e.ambiance, lighting: e.lighting, service: e.service,
        comfort: e.comfort, overallJoint: e.overallJoint,
      },
      bias: { hunger: e.hunger, stress: e.stress, horny: e.horny },
    };
  });

  // Roll up takes per curator so two burgers by one curator become one entry.
  const byCurator = new Map<string, EvaluationRow[]>();
  for (const e of evals) {
    const arr = byCurator.get(e.curatorId) ?? [];
    arr.push(e);
    byCurator.set(e.curatorId, arr);
  }
  const curatorTakes: CuratorTake[] = [...byCurator.entries()].map(
    ([curatorId, group]) => {
      const c = curatorName(curatorId, curators);
      const withQuote = group.find((g) => g.quote?.trim());
      return {
        curatorId,
        name: c.name,
        color: c.color,
        score: round(mean(group.map((g) => g.overall))),
        jointScore: round(mean(group.map((g) => g.overallJoint))),
        quote: (withQuote ?? group[0]).quote,
        burgerCount: group.length,
        evaluationIds: group.map((g) => g.id),
      };
    }
  );

  const disagreements = disagreementsFor(evals, curators);
  return {
    ...base,
    burgers,
    jointBars,
    curatorTakes,
    evaluations,
    disagreements,
    biggestDisagreement: disagreements[0] ?? null,
  };
}

export { burgerComponentMean, jointComponentMean, tier };
