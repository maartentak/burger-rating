CREATE TABLE "curators" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"avatar_url" text
);
--> statement-breakpoint
CREATE TABLE "establishments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_place_id" text,
	"name" text NOT NULL,
	"area" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"photo_url" text,
	"lat" double precision,
	"lng" double precision,
	"picked_by" text,
	"visited_month" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"curator_id" text NOT NULL,
	"burger_name" text DEFAULT '' NOT NULL,
	"price" text DEFAULT '' NOT NULL,
	"style" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"protein" text,
	"patty" integer DEFAULT 50 NOT NULL,
	"bun" integer DEFAULT 50 NOT NULL,
	"cheese" integer DEFAULT 50 NOT NULL,
	"sauce" integer DEFAULT 50 NOT NULL,
	"build" integer DEFAULT 50 NOT NULL,
	"value" integer DEFAULT 50 NOT NULL,
	"overall" integer DEFAULT 50 NOT NULL,
	"again" boolean,
	"ambiance" integer DEFAULT 50 NOT NULL,
	"lighting" integer DEFAULT 50 NOT NULL,
	"service" integer DEFAULT 50 NOT NULL,
	"comfort" integer DEFAULT 50 NOT NULL,
	"overall_joint" integer DEFAULT 50 NOT NULL,
	"hunger" integer DEFAULT 50 NOT NULL,
	"stress" integer DEFAULT 50 NOT NULL,
	"horny" integer DEFAULT 50 NOT NULL,
	"been_here" boolean,
	"quote" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;