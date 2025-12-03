#!/usr/bin/env node
// generate-secondlayer.js
const fs = require("fs");
const path = require("path");

if (process.argv.length < 3) {
  console.error("❌ Usage: node generate-secondlayer.js <input.svg>");
  process.exit(1);
}

const inputSvgPath = process.argv[2];
const svgContent = fs.readFileSync(inputSvgPath, "utf8");

console.log("🔍 Scanning SVG for region ids and names...");

let regions = [];
let seen = new Set();

// Detect g/path containing id + name (Ex: id="KL" name="Kerala")
const regex = /(?:<g[^>]*id="([^"]+)"[^>]*name="([^"]+)"|<path[^>]*id="([^"]+)"[^>]*name="([^"]+)")/g;
let match;

while ((match = regex.exec(svgContent)) !== null) {
  const id = match[1] || match[3];
  const name = match[2] || match[4];
  if (!seen.has(id)) {
    seen.add(id);
    regions.push({ id, name });
  }
}

console.log(`✔ ${regions.length} regions detected`);

const dataFolder = path.join(__dirname, "data");
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);

// ---------- Save layer2_regions.js ----------
const regionsJsPath = path.join(dataFolder, "layer2_regions.js");
fs.writeFileSync(
  regionsJsPath,
  "export default " + JSON.stringify(regions, null, 2) + ";\n"
);
console.log(`✔ regions saved → data/layer2_regions.js`);


// ---------- Generate dataset ----------
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// realistic vaccination style values
const dataset = regions.map(r => ({
  regionId: r.id,
  totalVaccinated: random(1_500_000, 12_000_000),
  fullyVaccinated: random(700_000, 8_000_000),
  partiallyVaccinated: random(200_000, 4_000_000),
}));

const datasetPath = path.join(dataFolder, "secondlayer_vaccinationData.js");
fs.writeFileSync(
  datasetPath,
  "export default " + JSON.stringify(dataset, null, 2) + ";\n"
);
console.log(`✔ dataset saved → data/secondlayer_vaccinationData.js`);


// ---------- Rewrite SVG with proper attributes ----------
let modifiedSvg = svgContent
  .replace(/stroke-width="[^"]*"/g, 'stroke-width="0.3"')
  .replace(/stroke="none"/g, 'stroke="#555"')
  .replace(/fill="[^"]*"/g, 'fill="#E5E7EB"') // light gray default
  .replace(/class="[^"]*"/g, "") // remove conflicting classes
  .replace(/data-id="[^"]*"/g, ""); // clean before rewrite

// Insert data-id="<regionId>" for each <path> or <g> id
regions.forEach(r => {
  const regexId = new RegExp(`id="${r.id}"`);
  modifiedSvg = modifiedSvg.replace(regexId, `id="${r.id}" data-id="${r.id}"`);
});

// Save the output SVG beside the script
const svgOutputPath = path.join(__dirname, "india.layer2.svg");
fs.writeFileSync(svgOutputPath, modifiedSvg);
console.log(`✔ SVG saved → ${svgOutputPath}`);

console.log("\n🎉 DONE — Layer-2 generation completed successfully\n");
