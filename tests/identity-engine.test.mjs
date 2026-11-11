import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Engine = require("../js/core/identity-engine.js");

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const sample = { name: "قهوة الصباح", activity: "food", style: "modern" };

test("missing fields are invalid", () => {
  assert.equal(Engine.generate({ name: "", activity: "food", style: "modern" }).valid, false);
  assert.equal(Engine.generate({ name: "x", activity: "nope", style: "modern" }).valid, false);
});

test("same input gives the same identity", () => {
  assert.deepEqual(Engine.generate(sample), Engine.generate(sample));
});

test("different names give different palettes", () => {
  const a = Engine.generate(sample).colors[0].hex;
  const b = Engine.generate({ ...sample, name: "مطعم الريف" }).colors[0].hex;
  assert.notEqual(a, b);
});

test("palette has four valid hex colours", () => {
  const { colors } = Engine.generate(sample);
  assert.equal(colors.length, 4);
  colors.forEach((c) => assert.match(c.hex, /^#[0-9a-f]{6}$/));
});

test("style decides the fonts", () => {
  assert.equal(Engine.generate({ ...sample, style: "luxury" }).fonts.heading, "Amiri");
});

test("logo SVG contains the project name", () => {
  const svg = Engine.logoSvg(Engine.generate(sample));
  assert.ok(svg.startsWith("<svg") && svg.includes("قهوة الصباح"));
});

test("hslToHex converts known colours", () => {
  assert.equal(Engine.hslToHex(0, 100, 50), "#ff0000");
  assert.equal(Engine.hslToHex(240, 100, 50), "#0000ff");
});

test("picked colours replace the generated ones", () => {
  const { colors } = Engine.generate({ ...sample, colors: ["#262262", "#f16623", "bad", "#FFFFFF"] });
  assert.equal(colors[0].hex, "#262262");
  assert.equal(colors[1].hex, "#f16623");
  assert.match(colors[2].hex, /^#[0-9a-f]{6}$/);
  assert.equal(colors[3].hex, "#ffffff");
});

test("chosen font overrides the style font", () => {
  const id = Engine.generate({ ...sample, font: "Reem Kufi" });
  assert.equal(id.fonts.heading, "Reem Kufi");
  assert.notEqual(id.fonts.body, "Reem Kufi");
  assert.equal(Engine.generate({ ...sample, font: "Comic Sans" }).fonts.heading, "Cairo");
});

test("description includes the project idea", () => {
  const id = Engine.generate({ ...sample, description: "مقهى مختص" });
  assert.ok(id.description.includes("مقهى مختص"));
});

let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log("  \u2713 " + name); }
  catch (err) { failed++; console.log("  \u2717 " + name + "\n    " + err.message); }
}
console.log("\n" + (tests.length - failed) + "/" + tests.length + " passed");
process.exit(failed ? 1 : 0);
