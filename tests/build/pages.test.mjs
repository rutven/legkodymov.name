import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("home lists app tiles sorted by order", () => {
  const html = read("dist/index.html");
  assert.ok(html.indexOf("Uči Srpski") > -1 && html.indexOf("Uči Srpski") < html.indexOf("Apartio"));
  assert.match(html, /href="\/apps\/uci-srpski\/"/);
  assert.match(html, /mailto:apps@legkodymov\.name/);
});

test("hosted privacy and deletion pages exist only for hosted apps", () => {
  assert.ok(existsSync("dist/apps/demo/privacy/index.html"));
  assert.ok(existsSync("dist/apps/demo/delete-account/index.html"));
  assert.ok(!existsSync("dist/apps/uci-srpski/privacy/index.html"));
});

test("coming-soon platform has no link", () => {
  const html = read("dist/apps/demo/index.html");
  assert.match(html, /Google Play[^<]*<[^>]*>\s*coming soon/i);
  assert.doesNotMatch(html, /href="[^"]*play\.google/);
});

test("site privacy page states cookieless analytics", () =>
  assert.match(read("dist/privacy/index.html"), /Cloudflare Web Analytics/));

test("404 page renders not-found content", () => {
  const html = read("dist/404.html");
  assert.match(html, /Page not found/);
  assert.match(html, /href="\/"/);
  assert.doesNotMatch(html, /rel="canonical"/);
});
