/** Emits a self-contained SQL file: schema DDL + curators + demo joints. */
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { buildDemoData } from "../src/db/demo";
import { DEFAULT_CURATORS } from "../src/lib/curators";

const q = (s: string) => `'${String(s).replace(/'/g, "''")}'`;
const nOrNull = (v: number | null | undefined) => (v == null ? "NULL" : String(v));
const bOrNull = (v: boolean | null | undefined) => (v == null ? "NULL" : v ? "true" : "false");

const ddl = readFileSync("drizzle/0000_init.sql", "utf8").replace(/-->.*/g, "");
const { establishments, evaluations } = buildDemoData();

// Map demo string ids -> real uuids.
const idMap = new Map<string, string>();
for (const e of establishments) idMap.set(e.id, randomUUID());

let out = `-- Patty Petrol · one-shot Neon setup (schema + sample board)
-- Paste this whole file into the Neon SQL Editor and press Run.

`;
out += ddl.trim() + "\n\n";

out += "-- Curators\n";
for (const c of DEFAULT_CURATORS) {
  out += `INSERT INTO curators (id, name, color, avatar_url) VALUES (${q(c.id)}, ${q(c.name)}, ${q(c.color)}, NULL) ON CONFLICT (id) DO NOTHING;\n`;
}

out += "\n-- Establishments\n";
for (const e of establishments) {
  out += `INSERT INTO establishments (id, name, area, address, picked_by, visited_month) VALUES ('${idMap.get(e.id)}', ${q(e.name)}, ${q(e.area)}, ${q(e.address)}, ${q(e.pickedBy ?? "")}, ${q(e.visitedMonth)});\n`;
}

out += "\n-- Evaluations\n";
for (const v of evaluations) {
  const cols = [
    "establishment_id", "curator_id", "burger_name", "price", "style", "protein",
    "patty", "bun", "cheese", "sauce", "build", "value", "overall", "again",
    "ambiance", "lighting", "service", "comfort", "overall_joint",
    "hunger", "stress", "horny", "been_here", "quote",
  ];
  const vals = [
    `'${idMap.get(v.establishmentId)}'`,
    q(v.curatorId),
    q(v.burgerName),
    q(v.price),
    `${q(JSON.stringify(v.style))}::jsonb`,
    v.protein ? q(v.protein) : "NULL",
    nOrNull(v.patty), nOrNull(v.bun), nOrNull(v.cheese), nOrNull(v.sauce),
    nOrNull(v.build), nOrNull(v.value), nOrNull(v.overall), bOrNull(v.again),
    nOrNull(v.ambiance), nOrNull(v.lighting), nOrNull(v.service), nOrNull(v.comfort),
    nOrNull(v.overallJoint), nOrNull(v.hunger), nOrNull(v.stress), nOrNull(v.horny),
    bOrNull(v.beenHere), q(v.quote),
  ];
  out += `INSERT INTO evaluations (${cols.join(", ")}) VALUES (${vals.join(", ")});\n`;
}

writeFileSync("neon-setup.sql", out);
console.log("Wrote neon-setup.sql");
