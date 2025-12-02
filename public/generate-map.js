const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

// === CONFIG ===
const INPUT = "india.svg";
const OUTPUT_SVG = "india.final.svg";
const OUTPUT_REGIONS = "regions.json";
const REGION_COUNT = 10;

// === LOAD SVG ===
console.log("🔍 Loading input:", INPUT);
const svgText = fs.readFileSync(INPUT, "utf8");

async function run() {
  const parser = new xml2js.Parser({ preserveChildrenOrder: true });
  const builder = new xml2js.Builder();

  const svgObj = await parser.parseStringPromise(svgText);
  const svg = svgObj.svg;

  const paths = svg.path;
  if (!paths) {
    console.error("❌ No <path> elements found in SVG!");
    return;
  }

  console.log(`📌 Found ${paths.length} paths`);

  // === Extract geometry: parse M/L coords from "d" attribute ===
  const getBBox = (d) => {
    const nums = [...d.matchAll(/[-+]?[0-9]*\.?[0-9]+/g)].map(Number);
    if (nums.length < 4) return null;

    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      cx: (Math.min(...xs) + Math.max(...xs)) / 2,
      cy: (Math.min(...ys) + Math.max(...ys)) / 2
    };
  };

  const regions = [];
  const valid = [];

  paths.forEach((p) => {
    if (!p.$.d) return;
    const box = getBBox(p.$.d);
    if (!box) return;
    valid.push({ p, box });
  });

  console.log(`🧩 Valid paths for clustering: ${valid.length}`);

  // === K-means clustering by center coords ===
  let centroids = valid.slice(0, REGION_COUNT).map(v => ({ x: v.box.cx, y: v.box.cy }));
  let changed;

  for (let iter = 0; iter < 20; iter++) {
    valid.forEach(v => {
      let best = 0;
      let bestDist = Infinity;

      centroids.forEach((c, i) => {
        const dist = (v.box.cx - c.x) ** 2 + (v.box.cy - c.y) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      v.region = best;
    });

    changed = false;
    centroids = Array.from({ length: REGION_COUNT }, () => ({ x: 0, y: 0, count: 0 }));

    valid.forEach(v => {
      const c = centroids[v.region];
      c.x += v.box.cx;
      c.y += v.box.cy;
      c.count++;
    });

    centroids.forEach(c => {
      if (c.count > 0) {
        c.x /= c.count;
        c.y /= c.count;
      }
    });
  }

  // === Assign region IDs in SVG ===
  const regionGroups = {};
  valid.forEach(v => {
    const r = v.region + 1;
    if (!regionGroups[r]) regionGroups[r] = [];

    regionGroups[r].push({
      name: `Region ${r}`,
      cx: v.box.cx,
      cy: v.box.cy
    });

    v.p.$["data-id"] = r.toString();
    if (!v.p.$["data-name"]) v.p.$["data-name"] = `Region ${r}`;
  });

  console.log("🏷  Regions assigned!");

  // === Save SVG ===
  const xmlOut = builder.buildObject(svgObj);
  fs.writeFileSync(OUTPUT_SVG, xmlOut);
  console.log("🎯 Saved:", OUTPUT_SVG);

  // === Save JSON ===
  fs.writeFileSync(OUTPUT_REGIONS, JSON.stringify(regionGroups, null, 2));
  console.log("📌 Saved:", OUTPUT_REGIONS);

  console.log("✨ Completed! Import india.final.svg in React!");
}

run().catch(console.error);
