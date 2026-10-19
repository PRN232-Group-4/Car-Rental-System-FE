// Calculate WCAG 2.1 / 2.2 Relative Luminance and Contrast Ratio
function srgbLuminance(r, g, b) {
  const [R, G, B] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function contrastRatio(fgHex, bgHex) {
  const l1 = srgbLuminance(...hexToRgb(fgHex));
  const l2 = srgbLuminance(...hexToRgb(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Alpha compositing formula over background: C = alpha * fg + (1 - alpha) * bg
function compositeColor(fgHex, bgHex, alpha) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const r = Math.round(alpha * fg[0] + (1 - alpha) * bg[0]);
  const g = Math.round(alpha * fg[1] + (1 - alpha) * bg[1]);
  const b = Math.round(alpha * fg[2] + (1 - alpha) * bg[2]);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const vvTests = [
  { name: "Plum Ink (#1A0B2E) on Warm Peach (#FFB7A5)", fg: "#1A0B2E", bg: "#FFB7A5", minAA: 4.5 },
  { name: "White (#FFFFFF) on Electric Violet Dark (#7A35FF)", fg: "#FFFFFF", bg: "#7A35FF", minAA: 4.5 },
  { name: "White (#FFFFFF) on Electric Violet Light (#6729D9)", fg: "#FFFFFF", bg: "#6729D9", minAA: 4.5 },
  { name: "Porcelain (#F0F2F5) on Midnight Plum Canvas (#1A0B2E)", fg: "#F0F2F5", bg: "#1A0B2E", minAA: 4.5 },
  { name: "Porcelain (#F0F2F5) on Raised Plum (#251735)", fg: "#F0F2F5", bg: "#251735", minAA: 4.5 },
  { name: "Plum Ink (#1A0B2E) on Light Canvas (#F0F2F5)", fg: "#1A0B2E", bg: "#F0F2F5", minAA: 4.5 },
  { name: "Plum Ink (#1A0B2E) on Pure White Panel (#FFFFFF)", fg: "#1A0B2E", bg: "#FFFFFF", minAA: 4.5 },
  { name: "White (#FFFFFF) on Danger Crimson (#C93B2B)", fg: "#FFFFFF", bg: "#C93B2B", minAA: 4.5 },
  { name: "Peach (#FFB7A5) on Midnight Plum (#1A0B2E) [Tag/Badge]", fg: "#FFB7A5", bg: "#1A0B2E", minAA: 4.5 },
  { name: "Plum Ink on Electric Violet [PROHIBITED PAIRING]", fg: "#1A0B2E", bg: "#7A35FF", minAA: 4.5, expectFail: true },
];

console.log("=== THÔNG DONG TRANSIT DESK PHASE 3E: VELVET VOLTAGE CONTRAST VERIFICATION ===\n");
let allPassed = true;
for (const t of vvTests) {
  const cr = contrastRatio(t.fg, t.bg);
  const pass = cr >= t.minAA;
  const status = t.expectFail ? (pass ? "UNEXPECTED PASS" : "KNOWN PROHIBITED (PASS)") : (pass ? "PASS (WCAG AA)" : "FAIL");
  if (!t.expectFail && !pass) allPassed = false;
  console.log(`${t.name.padEnd(65)}: ${cr.toFixed(3)}:1 -> ${status}`);
}

// Alpha composited surfaces
console.log("\n=== COMPOSITED ALPHA SURFACES CONTRAST ===");
const lightElevatedComp = compositeColor("#F8F5FC", "#F0F2F5", 0.90);
const crLightComp = contrastRatio("#1A0B2E", lightElevatedComp);
console.log(`Plum text (#1A0B2E) on 90% Light Elevated (${lightElevatedComp}): ${crLightComp.toFixed(3)}:1 -> ${crLightComp >= 4.5 ? "PASS (WCAG AA)" : "FAIL"}`);

const darkElevatedComp = compositeColor("#332242", "#1A0B2E", 0.88);
const crDarkComp = contrastRatio("#F0F2F5", darkElevatedComp);
console.log(`Porcelain text (#F0F2F5) on 88% Dark Elevated (${darkElevatedComp}): ${crDarkComp.toFixed(3)}:1 -> ${crDarkComp >= 4.5 ? "PASS (WCAG AA)" : "FAIL"}`);

if (!allPassed) {
  process.exit(1);
}
