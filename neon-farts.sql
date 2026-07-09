-- Patty Petrol · Fart Booth tables
-- Paste this whole file into the Neon SQL Editor and press Run. Safe to run once.

CREATE TABLE IF NOT EXISTS "farts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid,
	"curator_id" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"audio" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "fart_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fart_id" uuid NOT NULL,
	"curator_id" text NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "farts"
	ADD CONSTRAINT "farts_establishment_id_establishments_id_fk"
	FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id")
	ON DELETE set null ON UPDATE no action;

ALTER TABLE "fart_scores"
	ADD CONSTRAINT "fart_scores_fart_id_farts_id_fk"
	FOREIGN KEY ("fart_id") REFERENCES "public"."farts"("id")
	ON DELETE cascade ON UPDATE no action;
