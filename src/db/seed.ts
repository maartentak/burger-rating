/**
 * Seeds Neon with the three curators and the demo establishments/evaluations
 * so the Grease Board looks alive right away.
 *
 * Run with:  npm run db:seed   (needs DATABASE_URL in your environment)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { getDb, isDbConfigured } from "./client";
import { curators, establishments, evaluations } from "./schema";
import { buildDemoData } from "./demo";
import { DEFAULT_CURATORS } from "../lib/curators";

async function main() {
  if (!isDbConfigured) {
    console.error(
      "✗ DATABASE_URL is not set. Add it to .env.local (see .env.example) and try again."
    );
    process.exit(1);
  }
  const db = getDb();
  const { establishments: demoEsts, evaluations: demoEvals } = buildDemoData();

  console.log("→ Seeding curators…");
  for (const c of DEFAULT_CURATORS) {
    await db
      .insert(curators)
      .values({ id: c.id, name: c.name, color: c.color, avatarUrl: null })
      .onConflictDoNothing();
  }

  console.log("→ Clearing existing demo joints…");
  // (Fresh seed: wipe evaluations + establishments. Comment out to keep data.)
  await db.delete(evaluations);
  await db.delete(establishments);

  console.log("→ Seeding establishments + evaluations…");
  for (const est of demoEsts) {
    const [inserted] = await db
      .insert(establishments)
      .values({
        googlePlaceId: est.googlePlaceId,
        name: est.name,
        area: est.area,
        address: est.address,
        photoUrl: est.photoUrl,
        lat: est.lat,
        lng: est.lng,
        pickedBy: est.pickedBy,
        visitedMonth: est.visitedMonth,
      })
      .returning();

    const group = demoEvals.filter((e) => e.establishmentId === est.id);
    for (const ev of group) {
      const { id: _id, establishmentId: _eid, createdAt: _c, ...rest } = ev;
      void _id;
      void _eid;
      void _c;
      await db
        .insert(evaluations)
        .values({ ...rest, establishmentId: inserted.id });
    }
  }

  console.log("✓ Done. Fire up the app and hit the Grease Board.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
