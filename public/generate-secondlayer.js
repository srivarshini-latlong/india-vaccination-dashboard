const fs = require("fs");
const { JSDOM } = require("jsdom");

const input = process.argv[2];
if (!input) {
  console.error("❌ Usage: node generate-secondlayer.js <svg_file>");
  process.exit(1);
}

// ---------- STEP 1: READ FILE ----------
const raw = fs.readFileSync(input, "utf8");

// Remove XML header if present
let svg = raw.replace(/<\?xml[^>]*?>/g, "");

const dom = new JSDOM(svg, { contentType: "image/svg+xml" });
const doc = dom.window.document;
const svgRoot = doc.querySelector("svg");

if (!svgRoot) {
  console.error("❌ ERROR: No <svg> tag found in input.");
  process.exit(1);
}

// ---------- STEP 2: REMOVE nested <svg> ----------
doc.querySelectorAll("svg svg").forEach((nested) => {
  const g = doc.createElement("g");
  for (let i = 0; i < nested.attributes.length; i++) {
    const attr = nested.attributes[i];
    if (!["width", "height"].includes(attr.name)) {
      g.setAttribute(attr.name, attr.value);
    }
  }
  g.innerHTML = nested.innerHTML;
  nested.replaceWith(g);
});

// ---------- STEP 3: CLEAN STYLES + FORCE RESPONSIVE ----------
const styleTag = doc.querySelector("style");
if (styleTag) styleTag.textContent = "";

svgRoot.removeAttribute("width");
svgRoot.removeAttribute("height");

if (!svgRoot.getAttribute("viewBox") && !svgRoot.getAttribute("viewbox")) {
  svgRoot.setAttribute("viewBox", "0 0 700 650");
}

svgRoot.setAttribute("class", "w-full h-auto max-w-full");
svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");

// ---------- STEP 4: AUTO-DETECT REGIONS ----------
const allPaths = [...doc.querySelectorAll("path, polygon, polyline")];
let regionId = 1;
const regions = [];

for (const el of allPaths) {
  let bbox;
  try {
    bbox = el.getBBox();
  } catch {
    continue;
  }

  const id = String(regionId++);
  el.setAttribute("data-id", id);
  el.setAttribute("stroke", "#ffffff");
  el.setAttribute("stroke-width", "0.7");

  regions.push({
    id,
    bbox: {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      cx: bbox.x + bbox.width / 2,
      cy: bbox.y + bbox.height / 2,
    },
  });
}

// ---------- STEP 5: EXPORT CLEAN SVG ----------
const serialized = svgRoot.outerHTML;
const outSvg = input.replace(".svg", ".final.svg");
fs.writeFileSync(outSvg, serialized, "utf8");

// ---------- STEP 6: EXPORT regions.js ----------
const outRegions = input.replace(".svg", ".regions.js");
fs.writeFileSync(
  outRegions,
  `// Auto-generated region metadata for ${input}
const regions = ${JSON.stringify(regions, null, 2)};
export default regions;
`,
  "utf8"
);

// ---------- DONE ----------
console.log("✨ SECOND LAYER READY");
console.log("📌 Clean SVG :", outSvg);
console.log("📌 Regions   :", outRegions);
console.log("🟢 Total Regions:", regions.length);
