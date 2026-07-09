-- Patty Petrol · Bill-splitting table
-- Paste this whole file into the Neon SQL Editor and press Run. Safe to run once.

CREATE TABLE IF NOT EXISTS "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid,
	"description" text DEFAULT '' NOT NULL,
	"amount_cents" integer NOT NULL,
	"paid_by" text NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "expenses"
	ADD CONSTRAINT "expenses_establishment_id_establishments_id_fk"
	FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id")
	ON DELETE set null ON UPDATE no action;
