-- Patty Petrol · one-shot Neon setup (schema + sample board)
-- Paste this whole file into the Neon SQL Editor and press Run.

CREATE TABLE "curators" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"avatar_url" text
);

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

ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;

-- Curators
INSERT INTO curators (id, name, color, avatar_url) VALUES ('axel', 'Axel', '#F48FBB', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO curators (id, name, color, avatar_url) VALUES ('simon', 'Simon', '#F5C445', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO curators (id, name, color, avatar_url) VALUES ('marty', 'Marty', '#F0865A', NULL) ON CONFLICT (id) DO NOTHING;

-- Establishments
INSERT INTO establishments (id, name, area, address, picked_by, visited_month) VALUES ('28d6169f-602b-43a0-9142-7e86cadef6af', 'Bun Intended', 'De Pijp', 'Eerste van der Helststraat 12, Amsterdam', 'axel', 'Jun 2026');
INSERT INTO establishments (id, name, area, address, picked_by, visited_month) VALUES ('7b41e340-941a-4510-a878-966fea95aa0b', 'Holy Smokes', 'Oost', 'Javastraat 78, Amsterdam', 'marty', 'May 2026');
INSERT INTO establishments (id, name, area, address, picked_by, visited_month) VALUES ('9813c4a8-8c45-4108-b594-4e80f8a708c5', 'Griddle Me This', 'Centrum', 'Nieuwmarkt 4, Amsterdam', 'simon', 'Apr 2026');
INSERT INTO establishments (id, name, area, address, picked_by, visited_month) VALUES ('e309c07e-a9a3-4b56-af71-f0dbad4d2485', 'Patty & Co', 'West', 'Jan Evertsenstraat 45, Amsterdam', 'axel', 'Mar 2026');
INSERT INTO establishments (id, name, area, address, picked_by, visited_month) VALUES ('2c6faac5-3c4c-4531-9234-3fac973d4432', 'Burger Barn', 'Zuid', 'Beethovenstraat 30, Amsterdam', 'marty', 'Feb 2026');
INSERT INTO establishments (id, name, area, address, picked_by, visited_month) VALUES ('7f2836b8-0b18-4b23-9c89-9c3fa9155d46', 'Flat Freddy''s', 'Noord', 'Buiksloterweg 5, Amsterdam', 'simon', 'Jan 2026');

-- Evaluations
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('28d6169f-602b-43a0-9142-7e86cadef6af', 'axel', 'The Big Kahuna', '14.50', '["Smash"]'::jsonb, 'Beef', 95, 93, 91, 89, 98, 84, 93, true, 95, 89, 88, 92, 89, 45, 41, 16, false, 'Bun of the year. Not close.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('28d6169f-602b-43a0-9142-7e86cadef6af', 'simon', 'Green Machine', '13.00', '["Gourmet"]'::jsonb, 'Veg', 94, 92, 90, 88, 86, 84, 90, true, 95, 89, 88, 92, 89, 51, 47, 20, false, 'The sauce did the heavy lifting.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('28d6169f-602b-43a0-9142-7e86cadef6af', 'marty', 'Double Trouble', '16.00', '["Stack"]'::jsonb, 'Beef', 84, 93, 91, 89, 87, 84, 89, true, 95, 89, 88, 92, 89, 57, 20, 24, true, 'Docked a point: napkin shortage.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('7b41e340-941a-4510-a878-966fea95aa0b', 'axel', 'Brisket Case', '15.50', '["Classic"]'::jsonb, 'Beef', 84, 82, 91, 89, 87, 80, 86, true, 91, 85, 74, 88, 82, 66, 29, 30, false, 'A smoke ring you could propose with.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('7b41e340-941a-4510-a878-966fea95aa0b', 'simon', 'Pulled Rank', '16.50', '["Stack"]'::jsonb, 'Beef', 88, 86, 84, 93, 91, 80, 88, true, 91, 85, 74, 88, 82, 72, 35, 12, false, 'Sticky floors, stickier sauce.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('7b41e340-941a-4510-a878-966fea95aa0b', 'marty', 'The Fat Elvis', '17.00', '["Gourmet"]'::jsonb, 'Beef', 92, 90, 88, 86, 95, 80, 90, true, 91, 85, 74, 88, 82, 45, 41, 16, false, 'The Elvis changed me.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('9813c4a8-8c45-4108-b594-4e80f8a708c5', 'axel', 'Cluedo Classic', '13.50', '["Classic"]'::jsonb, 'Chicken', 88, 86, 84, 82, 80, 82, 83, true, 78, 72, 90, 75, 83, 54, 50, 22, false, 'Great crust, quiet room.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('9813c4a8-8c45-4108-b594-4e80f8a708c5', 'simon', 'Riddler Royale', '14.00', '["Smash"]'::jsonb, 'Beef', 83, 92, 90, 88, 86, 82, 87, true, 78, 72, 90, 75, 83, 60, 23, 26, true, 'Service so fast it felt illegal.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('9813c4a8-8c45-4108-b594-4e80f8a708c5', 'marty', 'Plot Twist', '15.00', '["Gourmet"]'::jsonb, 'Beef', 80, 78, 87, 85, 83, 82, 82, false, 78, 72, 90, 75, 83, 66, 29, 30, false, 'Fries stole the show. Suspicious.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('e309c07e-a9a3-4b56-af71-f0dbad4d2485', 'axel', 'The Founder', '18.00', '["Classic"]'::jsonb, 'Beef', 82, 80, 78, 76, 85, 66, 81, true, 85, 79, 82, 82, 78, 75, 38, 14, false, 'Solid. Aggressively solid.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('e309c07e-a9a3-4b56-af71-f0dbad4d2485', 'simon', 'Truffle Shuffle', '21.00', '["Gourmet"]'::jsonb, 'Beef', 81, 79, 77, 75, 73, 66, 78, false, 85, 79, 82, 82, 78, 48, 44, 18, false, 'Truffle oil is a cry for help.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('e309c07e-a9a3-4b56-af71-f0dbad4d2485', 'marty', 'Co-Pilot', '12.00', '["Slider"]'::jsonb, 'Chicken', 83, 81, 79, 77, 75, 66, 78, false, 85, 79, 82, 82, 78, 54, 50, 22, false, '€19 and the bun still fell apart.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('2c6faac5-3c4c-4531-9234-3fac973d4432', 'axel', 'Hay There', '13.00', '["Classic"]'::jsonb, 'Beef', 78, 76, 85, 83, 81, 75, 81, true, 80, 74, 68, 77, 74, 63, 26, 28, false, 'I liked it. I stand alone, apparently.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('2c6faac5-3c4c-4531-9234-3fac973d4432', 'simon', 'Silo Special', '12.50', '["Smash"]'::jsonb, 'Beef', 75, 73, 71, 80, 78, 75, 76, true, 80, 74, 68, 77, 74, 69, 32, 10, false, 'Fine. The word is fine.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('2c6faac5-3c4c-4531-9234-3fac973d4432', 'marty', 'Barnstormer', '14.00', '["Stack"]'::jsonb, 'Beef', 60, 58, 56, 54, 63, 75, 59, false, 80, 74, 68, 77, 74, 75, 38, 14, false, 'The patty had trust issues.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('7f2836b8-0b18-4b23-9c89-9c3fa9155d46', 'axel', 'Flat Out', '11.00', '["Smash"]'::jsonb, 'Beef', 68, 66, 64, 62, 60, 71, 64, false, 62, 56, 70, 59, 68, 51, 47, 20, false, 'Flat by name, flat by nature.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('7f2836b8-0b18-4b23-9c89-9c3fa9155d46', 'simon', 'The Freddy', '12.00', '["Classic"]'::jsonb, 'Beef', 63, 72, 70, 68, 66, 71, 68, false, 62, 56, 70, 59, 68, 57, 20, 24, true, 'The ketchup was the high point.');
INSERT INTO evaluations (establishment_id, curator_id, burger_name, price, style, protein, patty, bun, cheese, sauce, build, value, overall, again, ambiance, lighting, service, comfort, overall_joint, hunger, stress, horny, been_here, quote) VALUES ('7f2836b8-0b18-4b23-9c89-9c3fa9155d46', 'marty', 'Flat Stanley', '10.50', '["Slider"]'::jsonb, 'Chicken', 60, 58, 67, 65, 63, 71, 63, false, 62, 56, 70, 59, 68, 63, 26, 28, false, 'We do not speak of the bun.');
