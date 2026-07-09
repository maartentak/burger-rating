/**
 * The full evaluation questionnaire.
 * Ordered exactly as a curator walks through it, one question per screen.
 * Background colours cycle pink -> yellow -> olive -> blue -> orange per the spec.
 */

export type QuestionType =
  | "text"
  | "price"
  | "chips"
  | "protein"
  | "dial"
  | "toggle";

export type Section = "THE BURGER" | "THE JOINT" | "CURATOR BIAS";

export interface Question {
  id: string;
  type: QuestionType;
  section: Section;
  title: string;
  sub: string;
  /** For chips/protein questions. */
  options?: string[];
  /** Whether chips allow multiple selections. */
  multi?: boolean;
}

export const BURGER_STYLES = [
  "Smash",
  "Classic",
  "Gourmet",
  "Stack",
  "Slider",
  "Other",
];

export const PROTEINS = ["Beef", "Chicken", "Veg", "Other"];

export const QUESTIONS: Question[] = [
  // ---- META ----
  {
    id: "name",
    type: "text",
    section: "THE BURGER",
    title: "Name this beauty",
    sub: "As printed on the menu, typos included.",
  },
  {
    id: "price",
    type: "price",
    section: "THE BURGER",
    title: "Damage to the wallet?",
    sub: "Burger only — fries are their own journey.",
  },
  {
    id: "style",
    type: "chips",
    section: "THE BURGER",
    title: "What are we dealing with?",
    sub: "Pick all that apply.",
    options: BURGER_STYLES,
    multi: true,
  },
  {
    id: "protein",
    type: "protein",
    section: "THE BURGER",
    title: "What's the payload?",
    sub: "The main event, protein-wise.",
    options: PROTEINS,
    multi: false,
  },
  // ---- BURGER EVALUATION (0-100) ----
  {
    id: "patty",
    type: "dial",
    section: "THE BURGER",
    title: "The patty",
    sub: "Flavour, seasoning, juiciness, quality, cook.",
  },
  {
    id: "bun",
    type: "dial",
    section: "THE BURGER",
    title: "The bun",
    sub: "Freshness, toast, does it survive the last bite.",
  },
  {
    id: "cheese",
    type: "dial",
    section: "THE BURGER",
    title: "Cheese & toppings",
    sub: "Quality, melt, are they earning their place.",
  },
  {
    id: "sauce",
    type: "dial",
    section: "THE BURGER",
    title: "Sauce & seasoning",
    sub: "Flavour and amount — under- vs over-sauced.",
  },
  {
    id: "build",
    type: "dial",
    section: "THE BURGER",
    title: "Build & balance",
    sub: "Right ratios. Do the parts beat the sum.",
  },
  {
    id: "value",
    type: "dial",
    section: "THE BURGER",
    title: "Value",
    sub: "Is it worth the damage to the wallet.",
  },
  {
    id: "again",
    type: "toggle",
    section: "THE BURGER",
    title: "Order it again?",
    sub: "With your own money. Next week.",
  },
  {
    id: "overall",
    type: "dial",
    section: "THE BURGER",
    title: "Overall burger",
    sub: "Gut score. NOT an average. This is the one we rank on.",
  },
  // ---- JOINT EVALUATION (0-100) ----
  {
    id: "ambiance",
    type: "dial",
    section: "THE JOINT",
    title: "Ambiance & vibe",
    sub: "Does it feel good to be there.",
  },
  {
    id: "lighting",
    type: "dial",
    section: "THE JOINT",
    title: "Lighting",
    sub: "Mood — and can you actually photograph the burger.",
  },
  {
    id: "service",
    type: "dial",
    section: "THE JOINT",
    title: "Staff & service",
    sub: "Friendly, fast, knows the menu.",
  },
  {
    id: "comfort",
    type: "dial",
    section: "THE JOINT",
    title: "Comfort",
    sub: "Seating, space, noise for actual conversation.",
  },
  {
    id: "overallJoint",
    type: "dial",
    section: "THE JOINT",
    title: "Overall joint",
    sub: "Gut score for the establishment.",
  },
  // ---- CURATOR BIAS (0-100 + toggle) ----
  {
    id: "hunger",
    type: "dial",
    section: "CURATOR BIAS",
    title: "How hungry were you?",
    sub: "Upon arrival. Be honest.",
  },
  {
    id: "stress",
    type: "dial",
    section: "CURATOR BIAS",
    title: "How stressed were you?",
    sub: "Before you walked in.",
  },
  {
    id: "horny",
    type: "dial",
    section: "CURATOR BIAS",
    title: "How horny were you?",
    sub: "Before arrival. We don't judge. The data does.",
  },
  {
    id: "beenHere",
    type: "toggle",
    section: "CURATOR BIAS",
    title: "Been here before?",
    sub: "First timer or a regular.",
  },
];

/** The 6 burger component dials that make up the burger breakdown bars. */
export const BURGER_COMPONENT_DIALS = [
  "patty",
  "bun",
  "cheese",
  "sauce",
  "build",
  "value",
] as const;

/** The joint dials (excluding the gut "overall joint"). */
export const JOINT_DIALS = [
  "ambiance",
  "lighting",
  "service",
  "comfort",
] as const;

/** Section background palette, cycled per question index. */
export const QUESTION_PALETTE = [
  "#F48FBB",
  "#F5C445",
  "#A5B45B",
  "#AFC6E9",
  "#F0865A",
];

export type AnswerMap = {
  name: string;
  price: string;
  style: string[];
  protein: string | null;
  again: boolean | null;
  beenHere: boolean | null;
  quote: string;
} & Record<string, number | string | string[] | boolean | null>;

export function defaultAnswers(): AnswerMap {
  const a: AnswerMap = {
    name: "",
    price: "",
    style: [],
    protein: null,
    again: null,
    beenHere: null,
    quote: "",
  };
  for (const q of QUESTIONS) {
    if (q.type === "dial") a[q.id] = 50;
  }
  return a;
}
