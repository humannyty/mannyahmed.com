// Pre-renders the watercolour SVGs in art/ to WebP images in src/assets/.
//
// iPhone Safari can show a blank page when it has to run these big
// turbulence/displacement filters live across full-width scenes, so the site
// shows the rendered images instead. Run this only after editing art/*.svg:
//
//   npm install --no-save playwright && npx playwright install webkit
//   node scripts/render-art.mjs
import { readFile } from "node:fs/promises";
import { webkit } from "playwright";
import sharp from "sharp";

const SCALE = 2; // render at 2x the 1440px design width
const art = ["hero", "contact", "masthead", "grain"];

const browser = await webkit.launch();
for (const name of art) {
  const svg = await readFile(new URL(`../art/${name}.svg`, import.meta.url), "utf8");
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: SCALE });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
  await page.waitForTimeout(500);
  const grain = name === "grain"; // transparent tile, kept lossless so the fine noise survives
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, omitBackground: grain });
  const out = new URL(`../src/assets/${name}.${grain ? "png" : "webp"}`, import.meta.url).pathname;
  // The grain is one flat colour with varying alpha: keep the alpha channel and
  // flatten the colour to the rendered average (filters work in linearRGB, so it
  // comes out lighter than the matrix values suggest), which compresses better.
  let img = sharp(png);
  if (grain) {
    const [r, g, b] = (await sharp(png).stats()).channels.map((c) => Math.round(c.mean));
    img = sharp({ create: { width: w * SCALE, height: h * SCALE, channels: 3, background: { r, g, b } } })
      .joinChannel(await sharp(png).extractChannel("alpha").toBuffer());
  }
  const info = await (grain ? img.png({ palette: true, compressionLevel: 9, effort: 10 }) : img.webp({ quality: 82, effort: 6 })).toFile(out);
  console.log(`${name}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
  await page.close();
}
await browser.close();
