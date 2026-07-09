# 🍔 Patty Petrol

The Patty Patrol's private burger-rating rig. Add a joint, rate the burger and
the establishment one question at a time, then watch the standings fight it out
on **The Grease Board**.

Built with **Next.js 15** (App Router) · **Tailwind CSS v4** · **Framer Motion**
· **Neon Postgres** (via Drizzle ORM) · **Google Places API**.

---

## What's in the app

| Screen | Route | What it does |
|---|---|---|
| Home | `/` | Pick who you are, jump into a curation or the board |
| Curators | `/curators` | Axel · Simon · Marty — edit name & photo, see mini stats |
| Start a curation | `/curate` | Search Google Places to add a joint, or pick an existing one |
| Rate flow | `/curate/[id]/rate` | 21 questions, one per screen, ruler dials + reacting mascot |
| Scorecard | `/curate/[id]/scorecard` | Weighted receipt (70% burger / 30% joint) + lock it in |
| Establishment | `/establishment/[id]` | Combined scores, joint bars, **key disagreements**, curator takes |
| The Grease Board | `/board` | Podium, ranked list, hall of fame, beef of the month, trends & hidden insights |

**Scoring:** each dial is 0–100. The gut **Overall burger** and **Overall joint**
scores are what count — `total = round(overall_burger × 0.7 + overall_joint × 0.3)`.
The component dials (patty, bun, cheese…) show up as the breakdown bars.

---

## 🟢 Demo mode (works right now, no setup)

If you don't set up a database or an API key, the app still runs:

- **The Grease Board** shows six sample joints with full data.
- **Add a joint** returns believable mock search results.
- **Saving** is disabled (you'll see a friendly "connect Neon" note).

So you can deploy first and wire up the real services after. Below is the full,
noob-friendly walkthrough.

---

## 1 · Run it locally (optional)

```bash
npm install
npm run dev
# open http://localhost:3000
```

---

## 2 · Set up Neon (the database) 🐘

Neon is serverless Postgres. Free tier is plenty for the patrol.

### Easiest path — add Neon from inside Vercel (recommended)

This wires the database into your deployment automatically.

1. Push this repo to GitHub and import it into **Vercel** (see step 4).
2. In your Vercel project, open the **Storage** tab → **Create Database** →
   choose **Neon** (Postgres) → **Continue**.
3. Pick a name and region (closest to you) → **Create**.
4. Vercel connects it and **automatically adds a `DATABASE_URL`** environment
   variable to your project. You don't have to copy anything by hand. ✅
5. Redeploy (Vercel usually offers a button, or push a commit).

### Manual path — Neon directly

If you'd rather create it on Neon's own site:

1. Go to **https://neon.tech** → sign up (GitHub login is fine).
2. **Create a project** → name it `patty-petrol`, pick a region → **Create**.
3. On the project dashboard, find **Connection Details**.
4. Copy the **Pooled connection** string (it contains `-pooler` in the host and
   ends with `?sslmode=require`). Pooled is the right one for serverless.
5. Put it in Vercel: **Settings → Environment Variables** →
   `DATABASE_URL` = that string. Also add it to `.env.local` for local dev
   (copy `.env.example` → `.env.local` and paste).

### Create the tables + load sample data

**Option A — no terminal (easiest):** open your Neon project → **SQL Editor**
(left sidebar) → open the `neon-setup.sql` file from this repo, copy its entire
contents, paste into the editor, and click **Run**. That creates all three tables
and loads the sample board in one shot. Done.

**Option B — terminal:** with `DATABASE_URL` set in your local `.env.local`:

```bash
npm run db:push    # creates the tables in Neon from the schema
npm run db:seed    # loads the three curators + six sample joints
```

- `db:push` reads `src/db/schema.ts` and creates the tables — no migration
  files to manage.
- `db:seed` fills the board so it looks alive. Safe to re-run (it re-seeds).

> Tip: you can run these against the Neon database Vercel created too — just
> copy that `DATABASE_URL` into your local `.env.local` first.

---

## 3 · Set up Google Places API 🗺️

This powers "search for the joint" when adding an establishment.

1. Go to **https://console.cloud.google.com** and sign in.
2. Top bar → **Select a project** → **New Project** → name it `patty-petrol` →
   **Create**, then make sure it's selected.
3. You may be asked to set up **Billing**. Google requires a card, but Places
   has a generous free monthly credit and our usage is tiny. (You can set a
   budget alert under **Billing → Budgets** for peace of mind.)
4. Left menu → **APIs & Services → Library**. Search for **“Places API (New)”**
   and click **Enable**. (Enable the one that says *(New)*.)
5. Left menu → **APIs & Services → Credentials** → **+ Create Credentials** →
   **API key**. Copy the key that pops up.
6. **Restrict the key** (recommended): click the key → under **API
   restrictions** choose **Restrict key** → tick **Places API (New)** → **Save**.
   (Leave *Application restrictions* as “None” — this key is only ever used from
   our server, never the browser.)
7. Add it to Vercel: **Settings → Environment Variables** →
   `GOOGLE_PLACES_API_KEY` = your key. Add it to `.env.local` too for local dev.

> The key stays server-side. Search runs through `/api/places/search` and photos
> are proxied through `/api/places/photo`, so the key never reaches the browser.
> That's why it is **not** prefixed with `NEXT_PUBLIC_`.

---

## 4 · Deploy to Vercel ▲

1. Push this repo to GitHub.
2. **https://vercel.com** → **Add New… → Project** → import the repo.
3. Framework preset auto-detects **Next.js**. Click **Deploy**.
4. Add the two environment variables (**Settings → Environment Variables**):
   - `DATABASE_URL` — from Neon (or auto-added if you used Vercel's Storage tab)
   - `GOOGLE_PLACES_API_KEY` — from Google Cloud
5. **Redeploy** so the new variables take effect.
6. Run `npm run db:push` and `npm run db:seed` once (locally, pointed at the same
   `DATABASE_URL`) to create tables and seed the board.

That's it — share the URL with the patrol. 🎉

---

## 4b · Remove the sample joints

The seed loads six demo joints. Two ways to clear them once you're logging real
visits:

- **In the app (no SQL):** Curators → **⚙️ Admin desk**. Set yourself as **Marty**
  (he's the admin), then delete any joint — its reviews go with it.
- **All six at once (SQL):** paste this into the Neon SQL Editor. It removes only
  the seeded samples by name, so your own joints are safe:

  ```sql
  DELETE FROM establishments
  WHERE name IN ('Bun Intended','Holy Smokes','Griddle Me This',
                 'Patty & Co','Burger Barn','Flat Freddy''s');
  ```

Individual reviews can also be removed from a joint's breakdown → tap a burger or
a curator take → **Remove review**.

## 4c · Install it like an app (and set the icon)

The app is installable to a phone home screen / desktop (PWA) — on iPhone Safari:
**Share → Add to Home Screen**; on Android Chrome you'll get an "Install" prompt.

**The home-screen icon** is generated automatically into `/public` before every
build (`scripts/gen-icons.mjs`). To use your own artwork:

1. Put your image in `public/` named **`icon-source.png`** (jpg/webp also work).
   Easiest with no terminal: on GitHub open the repo → `public` folder →
   **Add file → Upload files** → drag it in → name it `icon-source.png` →
   **Commit**.
2. Redeploy on Vercel. The build squares & pads it onto a cream background and
   writes every needed size (192, 512, apple-touch, favicon). Done.

If no `icon-source.*` is present it falls back to the on-brand burger mascot
(`assets/icon-default.svg`). To regenerate locally: `npm run icons`.

## 4d · The Fart Booth (one-time table setup)

The 💨 "Record a fart" feature needs two extra tables. Paste **`neon-farts.sql`**
into the Neon SQL Editor once (same as before → **SQL Editor → paste → Run**).
After that: Home → **Record a fart** → tap to record (grant mic access), name it,
optionally tag a joint, and drop it on the record. The patrol scores each fart
0–100 and they rank on **The Fart Chart** (also shown per joint on its breakdown).

## Previous Seasons (historical archives)

Home → **Previous seasons** is a read-only archive of past club eras (currently
**The Pizza Era**, 2023–24). It's static data baked into the app — **no database
needed**. Each season is a JSON in `src/data/seasons/` rendered by
`/seasons/[slug]`.

To add another season later (new cuisine/year): drop its form export in
`scripts/seasons/`, adapt `scripts/build-season-pizza.mjs` to it, run it to emit
a JSON, and add that JSON to `SEASONS` in `src/lib/seasons.ts`. The recap pages
render any cuisine.

## 5 · Add the curator photos

Two ways:

- **In the app:** Curators → **Edit badge → 📷 Photo**. Saves to the database and
  overrides everything else. The **✂️ Cut out bg** toggle (on by default) removes
  a solid photo background so the curator's signature colour shows through — if it
  ever trims too much, switch it off.
- **Baked in:** drop the files in `public/avatars/` named `axel.png`,
  `simon.png`, `marty.png` (lowercase). Missing files just show the coloured
  initial — nothing breaks. See `public/avatars/README.md`.

---

## Environment variables

| Variable | Required for | Where it comes from |
|---|---|---|
| `DATABASE_URL` | Saving data | Neon (or Vercel's Neon integration) |
| `GOOGLE_PLACES_API_KEY` | Real place search | Google Cloud Console |

Copy `.env.example` → `.env.local` for local development. Never commit
`.env.local` (it's gitignored).

---

## Handy scripts

```bash
npm run dev       # local dev server
npm run build     # production build
npm run start     # run the production build
npm run db:push   # create/update Neon tables from the schema
npm run db:seed   # load curators + sample joints
```

---

## Project layout

```
src/
  app/                     # pages + API route handlers
    api/                   #   places, establishments, evaluations, curators, dashboard
    curate/[id]/rate       #   the question-per-question flow
    curate/[id]/scorecard  #   the receipt + lock-in
    establishment/[id]     #   combined breakdown
    board                  #   the Grease Board
  components/              # Mascot/SVG art, RulerDial, Avatar, ScoreChip, shell…
  db/                      # Drizzle schema, Neon client, demo data, seed, data access
  lib/                     # questions, scoring, aggregation, curators, hooks
public/avatars/           # drop-in curator photos
```
