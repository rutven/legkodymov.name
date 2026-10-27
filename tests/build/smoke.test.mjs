import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("home page is UTF-8 English with developer name", () => {
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<meta charset="utf-8"/i);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(html, /Sergei Legkodymov/);
  assert.doesNotMatch(html, /Sergey/);
});
