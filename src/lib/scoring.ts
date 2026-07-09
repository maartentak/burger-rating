import { BURGER_COMPONENT_DIALS, JOINT_DIALS } from "./questions";

/** Score-chip colour tiers from the spec: >=85 olive, 70-84 yellow, <70 orange. */
export function tier(score: number): {
  bg: string;
  fg: string;
  name: "high" | "mid" | "low";
} {
  if (score >= 85) return { bg: "#A5B45B", fg: "#ffffff", name: "high" };
  if (score >= 70) return { bg: "#F5C445", fg: "#1B1713", name: "mid" };
  return { bg: "#F0865A", fg: "#1B1713", name: "low" };
}

export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function round(n: number): number {
  return Math.round(n);
}

/** Fields stored on an evaluation that hold dial scores. */
export interface EvaluationScores {
  patty: number;
  bun: number;
  cheese: number;
  sauce: number;
  build: number;
  value: number;
  overall: number; // gut burger score — the ranking metric
  ambiance: number;
  lighting: number;
  service: number;
  comfort: number;
  overallJoint: number; // gut joint score
}

/** Mean of the 6 burger component dials (for the receipt breakdown bars). */
export function burgerComponentMean(e: EvaluationScores): number {
  return mean(BURGER_COMPONENT_DIALS.map((k) => e[k]));
}

/** Mean of the 4 joint component dials. */
export function jointComponentMean(e: EvaluationScores): number {
  return mean(JOINT_DIALS.map((k) => e[k]));
}

/**
 * House-rules total for a single evaluation.
 * The gut "overall burger" carries 70%, the gut "overall joint" 30%.
 */
export function evaluationTotal(e: EvaluationScores): number {
  return round(e.overall * 0.7 + e.overallJoint * 0.3);
}
