import type { EstablishmentRow, EvaluationRow } from "./schema";

/**
 * Placeholder dataset from the design handoff — six joints, each rated by all
 * three curators. Powers the seed script AND the no-database demo mode so the
 * Grease Board looks alive before Neon is wired up.
 */

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

interface Take {
  curator: "axel" | "simon" | "marty";
  burger: string;
  style: string[];
  protein: string;
  price: string;
  overall: number; // gut burger score
  again: boolean;
  beenHere: boolean;
  quote: string;
}

interface DemoPlace {
  id: string;
  name: string;
  area: string;
  address: string;
  when: string;
  pickedBy: string;
  photoUrl: string | null;
  // joint feel (Service / Vibe / Value from the design)
  service: number;
  vibe: number;
  value: number;
  takes: Take[];
}

const PLACES: DemoPlace[] = [
  {
    id: "bun",
    name: "Bun Intended",
    area: "De Pijp",
    address: "Eerste van der Helststraat 12, Amsterdam",
    when: "Jun 2026",
    pickedBy: "axel",
    photoUrl: null,
    service: 88,
    vibe: 95,
    value: 84,
    takes: [
      { curator: "axel", burger: "The Big Kahuna", style: ["Smash"], protein: "Beef", price: "14.50", overall: 93, again: true, beenHere: false, quote: "Bun of the year. Not close." },
      { curator: "simon", burger: "Green Machine", style: ["Gourmet"], protein: "Veg", price: "13.00", overall: 90, again: true, beenHere: false, quote: "The sauce did the heavy lifting." },
      { curator: "marty", burger: "Double Trouble", style: ["Stack"], protein: "Beef", price: "16.00", overall: 89, again: true, beenHere: true, quote: "Docked a point: napkin shortage." },
    ],
  },
  {
    id: "holy",
    name: "Holy Smokes",
    area: "Oost",
    address: "Javastraat 78, Amsterdam",
    when: "May 2026",
    pickedBy: "marty",
    photoUrl: null,
    service: 74,
    vibe: 91,
    value: 80,
    takes: [
      { curator: "axel", burger: "Brisket Case", style: ["Classic"], protein: "Beef", price: "15.50", overall: 86, again: true, beenHere: false, quote: "A smoke ring you could propose with." },
      { curator: "simon", burger: "Pulled Rank", style: ["Stack"], protein: "Beef", price: "16.50", overall: 88, again: true, beenHere: false, quote: "Sticky floors, stickier sauce." },
      { curator: "marty", burger: "The Fat Elvis", style: ["Gourmet"], protein: "Beef", price: "17.00", overall: 90, again: true, beenHere: false, quote: "The Elvis changed me." },
    ],
  },
  {
    id: "griddle",
    name: "Griddle Me This",
    area: "Centrum",
    address: "Nieuwmarkt 4, Amsterdam",
    when: "Apr 2026",
    pickedBy: "simon",
    photoUrl: null,
    service: 90,
    vibe: 78,
    value: 82,
    takes: [
      { curator: "axel", burger: "Cluedo Classic", style: ["Classic"], protein: "Chicken", price: "13.50", overall: 83, again: true, beenHere: false, quote: "Great crust, quiet room." },
      { curator: "simon", burger: "Riddler Royale", style: ["Smash"], protein: "Beef", price: "14.00", overall: 87, again: true, beenHere: true, quote: "Service so fast it felt illegal." },
      { curator: "marty", burger: "Plot Twist", style: ["Gourmet"], protein: "Beef", price: "15.00", overall: 82, again: false, beenHere: false, quote: "Fries stole the show. Suspicious." },
    ],
  },
  {
    id: "patco",
    name: "Patty & Co",
    area: "West",
    address: "Jan Evertsenstraat 45, Amsterdam",
    when: "Mar 2026",
    pickedBy: "axel",
    photoUrl: null,
    service: 82,
    vibe: 85,
    value: 66,
    takes: [
      { curator: "axel", burger: "The Founder", style: ["Classic"], protein: "Beef", price: "18.00", overall: 81, again: true, beenHere: false, quote: "Solid. Aggressively solid." },
      { curator: "simon", burger: "Truffle Shuffle", style: ["Gourmet"], protein: "Beef", price: "21.00", overall: 78, again: false, beenHere: false, quote: "Truffle oil is a cry for help." },
      { curator: "marty", burger: "Co-Pilot", style: ["Slider"], protein: "Chicken", price: "12.00", overall: 78, again: false, beenHere: false, quote: "€19 and the bun still fell apart." },
    ],
  },
  {
    id: "barn",
    name: "Burger Barn",
    area: "Zuid",
    address: "Beethovenstraat 30, Amsterdam",
    when: "Feb 2026",
    pickedBy: "marty",
    photoUrl: null,
    service: 68,
    vibe: 80,
    value: 75,
    takes: [
      { curator: "axel", burger: "Hay There", style: ["Classic"], protein: "Beef", price: "13.00", overall: 81, again: true, beenHere: false, quote: "I liked it. I stand alone, apparently." },
      { curator: "simon", burger: "Silo Special", style: ["Smash"], protein: "Beef", price: "12.50", overall: 76, again: true, beenHere: false, quote: "Fine. The word is fine." },
      { curator: "marty", burger: "Barnstormer", style: ["Stack"], protein: "Beef", price: "14.00", overall: 59, again: false, beenHere: false, quote: "The patty had trust issues." },
    ],
  },
  {
    id: "freddy",
    name: "Flat Freddy's",
    area: "Noord",
    address: "Buiksloterweg 5, Amsterdam",
    when: "Jan 2026",
    pickedBy: "simon",
    photoUrl: null,
    service: 70,
    vibe: 62,
    value: 71,
    takes: [
      { curator: "axel", burger: "Flat Out", style: ["Smash"], protein: "Beef", price: "11.00", overall: 64, again: false, beenHere: false, quote: "Flat by name, flat by nature." },
      { curator: "simon", burger: "The Freddy", style: ["Classic"], protein: "Beef", price: "12.00", overall: 68, again: false, beenHere: true, quote: "The ketchup was the high point." },
      { curator: "marty", burger: "Flat Stanley", style: ["Slider"], protein: "Chicken", price: "10.50", overall: 63, again: false, beenHere: false, quote: "We do not speak of the bun." },
    ],
  },
];

// Deterministic little wobble so demo component dials aren't all identical.
const wob = (seed: number, i: number) => ((seed * 7 + i * 13) % 11) - 5;

export function buildDemoData(): {
  establishments: EstablishmentRow[];
  evaluations: EvaluationRow[];
} {
  const establishments: EstablishmentRow[] = [];
  const evaluations: EvaluationRow[] = [];

  PLACES.forEach((p, pi) => {
    establishments.push({
      id: `demo-${p.id}`,
      googlePlaceId: null,
      name: p.name,
      area: p.area,
      address: p.address,
      photoUrl: p.photoUrl,
      lat: null,
      lng: null,
      pickedBy: p.pickedBy,
      visitedMonth: p.when,
      createdAt: new Date(`2026-01-01T00:00:00Z`),
    });

    p.takes.forEach((t, ti) => {
      const o = t.overall;
      evaluations.push({
        id: `demo-${p.id}-${t.curator}`,
        establishmentId: `demo-${p.id}`,
        curatorId: t.curator,
        burgerName: t.burger,
        price: t.price,
        style: t.style,
        protein: t.protein,
        patty: clamp(o + wob(pi + 1, ti)),
        bun: clamp(o + wob(pi + 2, ti + 1)),
        cheese: clamp(o + wob(pi + 3, ti + 2)),
        sauce: clamp(o + wob(pi + 4, ti + 3)),
        build: clamp(o + wob(pi + 5, ti + 4)),
        value: p.value,
        overall: o,
        again: t.again,
        ambiance: p.vibe,
        lighting: clamp(p.vibe - 6),
        service: p.service,
        comfort: clamp(p.vibe - 3),
        overallJoint: clamp((p.service + p.vibe + p.value) / 3),
        hunger: clamp(60 + wob(pi, ti) * 3),
        stress: clamp(35 + wob(pi + 1, ti) * 3),
        horny: clamp(20 + wob(pi + 2, ti) * 2),
        beenHere: t.beenHere,
        quote: t.quote,
        createdAt: new Date(`2026-01-01T00:00:00Z`),
      });
    });
  });

  return { establishments, evaluations };
}
