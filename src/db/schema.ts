import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  doublePrecision,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

/** The three curators. Seeded once; name/avatar editable in-app. */
export const curators = pgTable("curators", {
  id: text("id").primaryKey(), // 'axel' | 'simon' | 'marty'
  name: text("name").notNull(),
  color: text("color").notNull(),
  avatarUrl: text("avatar_url"),
});

/** A burger joint the patrol has visited (created from Google Places). */
export const establishments = pgTable("establishments", {
  id: uuid("id").defaultRandom().primaryKey(),
  googlePlaceId: text("google_place_id"),
  name: text("name").notNull(),
  area: text("area").notNull().default(""),
  address: text("address").notNull().default(""),
  photoUrl: text("photo_url"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  pickedBy: text("picked_by"), // curator id who suggested it
  visitedMonth: text("visited_month").notNull().default(""), // e.g. "Jul 2026"
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One curator's full evaluation of one burger at one establishment. */
export const evaluations = pgTable("evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  curatorId: text("curator_id").notNull(),

  // burger meta
  burgerName: text("burger_name").notNull().default(""),
  price: text("price").notNull().default(""),
  style: jsonb("style").$type<string[]>().notNull().default([]),
  protein: text("protein"),

  // burger evaluation (0-100)
  patty: integer("patty").notNull().default(50),
  bun: integer("bun").notNull().default(50),
  cheese: integer("cheese").notNull().default(50),
  sauce: integer("sauce").notNull().default(50),
  build: integer("build").notNull().default(50),
  value: integer("value").notNull().default(50),
  overall: integer("overall").notNull().default(50), // gut burger score
  again: boolean("again"),

  // joint evaluation (0-100)
  ambiance: integer("ambiance").notNull().default(50),
  lighting: integer("lighting").notNull().default(50),
  service: integer("service").notNull().default(50),
  comfort: integer("comfort").notNull().default(50),
  overallJoint: integer("overall_joint").notNull().default(50),

  // curator bias
  hunger: integer("hunger").notNull().default(50),
  stress: integer("stress").notNull().default(50),
  horny: integer("horny").notNull().default(50),
  beenHere: boolean("been_here"),

  quote: text("quote").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** A recorded fart, optionally tied to a joint. Audio is a base64 data URL. */
export const farts = pgTable("farts", {
  id: uuid("id").defaultRandom().primaryKey(),
  establishmentId: uuid("establishment_id").references(() => establishments.id, {
    onDelete: "set null",
  }),
  curatorId: text("curator_id").notNull(), // who recorded it
  name: text("name").notNull().default(""),
  audio: text("audio").notNull(), // data URL, e.g. data:audio/webm;base64,...
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One curator's score (0-100) for a fart. One per curator per fart. */
export const fartScores = pgTable("fart_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  fartId: uuid("fart_id")
    .notNull()
    .references(() => farts.id, { onDelete: "cascade" }),
  curatorId: text("curator_id").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EstablishmentRow = typeof establishments.$inferSelect;
export type EvaluationRow = typeof evaluations.$inferSelect;
export type CuratorRow = typeof curators.$inferSelect;
export type FartRow = typeof farts.$inferSelect;
export type FartScoreRow = typeof fartScores.$inferSelect;
