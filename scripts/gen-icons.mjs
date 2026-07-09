/**
 * Generates the PWA / home-screen icon set into /public.
 *
 * Source priority:
 *   1. public/icon-source.(png|jpg|jpeg|webp)  ← drop YOUR image here
 *   2. assets/icon-default.svg                 ← on-brand fallback
 *
 * The source is centred and padded onto a cream square, then written at every
 * size a browser / phone might ask for. Runs automatically before `next build`
 * (see the "prebuild" script), so uploading a new source image and redeploying
 * is all it takes. Never fails the build — on any error the committed defaults
 * stay in place.
 */
import sharp from "sharp";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";
const CREAM = { r: 246, g: 241, b: 229, alpha: 1 };

const source = ["icon-source.png", "icon-source.jpg", "icon-source.jpeg", "icon-source.webp"]
  .map((f) => join(PUB, f))
  .find(existsSync);

async function square(sizePx, padFraction) {
  const inner = Math.round(sizePx * (1 - padFraction * 2));
  const input = source
    ? sharp(source)
    : sharp(readFileSync("assets/icon-default.svg"), { density: 512 });
  const fitted = await input
    .resize(inner, inner, { fit: "contain", background: CREAM })
    .png()
    .toBuffer();
  return sharp({
    create: { width: sizePx, height: sizePx, channels: 4, background: CREAM },
  })
    .composite([{ input: fitted, gravity: "center" }])
    .png();
}

async function main() {
  const jobs = [
    { size: 512, pad: 0.1, file: "icon-512.png" },
    { size: 512, pad: 0.1, file: "icon.png" },
    { size: 192, pad: 0.1, file: "icon-192.png" },
    { size: 180, pad: 0.06, file: "apple-icon.png" },
    { size: 32, pad: 0.04, file: "favicon-32.png" },
  ];
  for (const j of jobs) {
    const img = await square(j.size, j.pad);
    await img.toFile(join(PUB, j.file));
  }
  console.log(`✓ Icons generated from ${source ? source : "assets/icon-default.svg"}`);
}

main().catch((err) => {
  console.warn("⚠ Icon generation skipped:", err.message);
  process.exit(0); // never break the build
});
