const fs = require("fs");
const path = require("path");

const svgFile = process.argv[2];
if (!svgFile) return console.log("❌ Usage: node fix_svg.js second_layer.svg");

const regions = require("./data/layer2_regions.json"); // JSON version we prepared

const input = fs.readFileSync(svgFile, "utf8");
let output = input;

for (const id in regions) {
  const name = regions[id];
  const regex = new RegExp(`(class="st${id}"[^>]*?)>`, "g");
  output = output.replace(regex, `$1 data-id="${id}" data-name="${name}">`);
}

const resultPath = path.join(__dirname, "india.layer2.svg");
fs.writeFileSync(resultPath, output, "utf8");

console.log("✔ Done → public/india.layer2.svg updated with correct data-ids");
