/**
 * Parses the 2023–24 pizza Google-Form export into a normalized "season" JSON
 * that the /seasons recap pages render. Run: `npm run seasons:pizza`.
 *
 * Handles: the mid-season scale change (1–5 → 1–10, normalized to %),
 * European decimal prices, the "Pugliese"/"Pizzeria Pugliese" merge, and the
 * Marti/Axeli/Simoni → Marty/Axel/Simon reviewer mapping.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CSV = join(here, "seasons", "pizza-2024.csv");
const OUT = join(here, "..", "src", "data", "seasons", "pizza-2024.json");

const CURATORS = {
  marti: { id: "marty", name: "Marty", color: "#F0865A" },
  axeli: { id: "axel", name: "Axel", color: "#F48FBB" },
  simoni: { id: "simon", name: "Simon", color: "#F5C445" },
};

// --- tiny CSV parser (handles quoted fields with commas) ---
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* ignore */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const num = (s) => {
  const v = parseFloat(String(s).replace(",", "."));
  return Number.isFinite(v) ? v : null;
};
const round = (n) => Math.round(n);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

const raw = readFileSync(CSV, "utf8");
const rows = parseCsv(raw).filter((r) => r.length > 5 && r[0] && r[0] !== "Timestamp");

// scale: pre-2024-07 forms were 1–5, later ones 1–10.
function scaleFor(ts) {
  const d = new Date(ts);
  return d < new Date("2024-07-01") ? 5 : 10;
}
function monthLabel(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}
function mergeName(n) {
  const t = n.trim();
  if (/pugliese/i.test(t)) return "Pizzeria Pugliese";
  return t;
}

const TASTE = [
  { key: "taste", label: "Taste", idx: 3 },
  { key: "texture", label: "Texture", idx: 4 },
  { key: "fold", label: "Foldability", idx: 5 },
  { key: "sauce", label: "Sauce/crust ratio", idx: 6 },
  { key: "tastiness", label: "Tastiness", idx: 7 },
];
const JOINT = [
  { key: "ambiance", label: "Ambiance", idx: 16 },
  { key: "service", label: "Service", idx: 17 },
  { key: "value", label: "Price / quality", idx: 18 },
];

const reviews = rows.map((r) => {
  const ts = r[0];
  const scale = scaleFor(ts);
  const norm = (idx) => {
    const v = num(r[idx]);
    return v == null ? null : round((v / scale) * 100);
  };
  const rev = CURATORS[String(r[19]).trim().toLowerCase()] ?? {
    id: "unknown", name: r[19], color: "#AFC6E9",
  };
  const metrics = {};
  for (const m of TASTE) metrics[m.key] = norm(m.idx);
  const joint = {};
  for (const m of JOINT) joint[m.key] = norm(m.idx);
  const itemScore = round(mean(TASTE.map((m) => metrics[m.key]).filter((x) => x != null)));
  const jointScore = round(mean(JOINT.map((m) => joint[m.key]).filter((x) => x != null)));
  const cheesePresent = /ja/i.test(r[9]);
  return {
    ts,
    when: monthLabel(ts),
    place: mergeName(r[15]),
    itemName: r[1].trim(),
    curatorId: rev.id,
    curatorName: rev.name,
    color: rev.color,
    price: num(r[2]),
    metrics,
    joint,
    itemScore,
    jointScore,
    total: round(itemScore * 0.7 + jointScore * 0.3),
    worth: norm(14),
    sauce: /rood/i.test(r[8]) ? "Red" : /wit/i.test(r[8]) ? "White" : r[8],
    cheese: cheesePresent ? (r[10] || "").trim() || "Cheese" : "No cheese",
    bias: { day: norm(20), hunger: norm(21), horny: norm(22) },
    quote: (r[23] || "").trim(),
  };
});

// group into places, ordered by first visit
const placeMap = new Map();
for (const rv of reviews) {
  if (!placeMap.has(rv.place)) placeMap.set(rv.place, []);
  placeMap.get(rv.place).push(rv);
}
const places = [...placeMap.entries()]
  .map(([name, revs]) => {
    const itemScore = round(mean(revs.map((r) => r.itemScore)));
    const jointScore = round(mean(revs.map((r) => r.jointScore)));
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name,
      when: revs[0].when,
      ts: revs[0].ts,
      itemScore,
      jointScore,
      total: round(itemScore * 0.7 + jointScore * 0.3),
      reviews: revs,
    };
  })
  .sort((a, b) => new Date(a.ts) - new Date(b.ts));

const ranked = [...places].sort((a, b) => b.total - a.total);

// best single pizza
let bestItem = null;
for (const rv of reviews) if (!bestItem || rv.itemScore > bestItem.itemScore) bestItem = rv;

// trend across visits (chronological)
const trend = places.map((p) => ({ when: p.when, value: p.total }));

// red vs white
const red = reviews.filter((r) => r.sauce === "Red");
const white = reviews.filter((r) => r.sauce === "White");
const redVsWhite = {
  red: { avg: round(mean(red.map((r) => r.itemScore))), count: red.length },
  white: { avg: round(mean(white.map((r) => r.itemScore))), count: white.length },
};

// cheese
const cheeseMap = new Map();
for (const r of reviews) {
  if (r.cheese === "No cheese") continue;
  // split combos like "Mozerella, Gorgonzola"
  for (const c of r.cheese.split(/,|\//).map((s) => s.trim()).filter(Boolean)) {
    const key = c.replace(/\s+/g, " ");
    if (!cheeseMap.has(key)) cheeseMap.set(key, []);
    cheeseMap.get(key).push(r.itemScore);
  }
}
let favouriteCheese = null;
let topCheese = null;
for (const [name, scores] of cheeseMap) {
  if (!favouriteCheese || scores.length > favouriteCheese.count)
    favouriteCheese = { name, count: scores.length, avg: round(mean(scores)) };
  if (scores.length >= 2 && (!topCheese || mean(scores) > topCheese.avg))
    topCheese = { name, avg: round(mean(scores)), count: scores.length };
}

// curator generosity
const curators = Object.values(CURATORS).map((c) => {
  const mine = reviews.filter((r) => r.curatorId === c.id);
  return { id: c.id, name: c.name, color: c.color, count: mine.length, avgGiven: round(mean(mine.map((r) => r.itemScore))) };
});
const byGen = [...curators].sort((a, b) => b.avgGiven - a.avgGiven);

// horny stat + fun correlation
const hornyAvg = round(mean(reviews.map((r) => r.bias.horny).filter((x) => x != null)));
const hi = reviews.filter((r) => (r.bias.horny ?? 0) >= hornyAvg);
const lo = reviews.filter((r) => (r.bias.horny ?? 0) < hornyAvg);
const hornyDiff = hi.length && lo.length ? round(mean(hi.map((r) => r.itemScore)) - mean(lo.map((r) => r.itemScore))) : 0;

// value pick (best score-per-euro)
let value = null;
for (const r of reviews) {
  if (!r.price) continue;
  const ratio = r.itemScore / r.price;
  if (!value || ratio > value.ratio) value = { name: r.itemName, place: r.place, price: r.price, score: r.itemScore, ratio };
}

// foldability champ
let fold = null;
for (const r of reviews) if (r.metrics.fold != null && (!fold || r.metrics.fold > fold.value)) fold = { name: r.itemName, place: r.place, value: r.metrics.fold };

const quotes = reviews.filter((r) => r.quote).map((r) => ({ text: r.quote, curatorName: r.curatorName, place: r.place, item: r.itemName }));

const season = {
  slug: "pizza-2024",
  cuisine: "Pizza",
  emoji: "🍕",
  title: "The Pizza Era",
  dateRange: `${places[0].when} – ${places[places.length - 1].when}`,
  blurb: "Before the burgers, there was dough. Six pizzerias, one crown.",
  scaleNote:
    "Scores are normalized to %. The rating scale changed from 1–5 to 1–10 partway through the season, so early scores skew a touch high — compare with a pinch of oregano.",
  metricLabels: TASTE.map(({ key, label }) => ({ key, label })),
  jointLabels: JOINT.map(({ key, label }) => ({ key, label })),
  places,
  podium: ranked.slice(0, 3),
  ranked,
  bestItem: { name: bestItem.itemName, place: bestItem.place, curatorName: bestItem.curatorName, score: bestItem.itemScore },
  trend,
  redVsWhite,
  cheese: { favourite: favouriteCheese, topRated: topCheese },
  curators,
  generous: byGen[0]?.name ?? null,
  harsh: byGen[byGen.length - 1]?.name ?? null,
  horny: {
    avg: hornyAvg,
    note:
      hornyDiff > 2
        ? `Friskier arrivals rated pizzas ${hornyDiff} pts higher. Make of that what you will.`
        : hornyDiff < -2
        ? `Friskier arrivals rated ${Math.abs(hornyDiff)} pts lower. Focus, gentlemen.`
        : "No meaningful link between friskiness and scores. Professionals.",
  },
  value: value ? { name: value.name, place: value.place, price: value.price, score: value.score } : null,
  fold,
  quotes,
};

writeFileSync(OUT, JSON.stringify(season, null, 2));
console.log(`✓ Wrote ${OUT} — ${places.length} places, ${reviews.length} pizzas`);
