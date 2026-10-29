import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("robots.txt allows all agents and references the sitemap", () => {
  const txt = read("dist/robots.txt");
  assert.match(txt, /^User-agent: \*$/m);
  assert.match(txt, /^Allow: \/$/m);
  assert.match(txt, /^Sitemap: https:\/\/legkodymov\.name\/sitemap\.xml$/m);
});

test("sitemap lists site, app and hosted pages", () => {
  const xml = read("dist/sitemap.xml");
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  for (const path of ["/", "/privacy/", "/apps/uci-srpski/", "/apps/demo/privacy/", "/apps/demo/delete-account/"])
    assert.ok(xml.includes(`<loc>https://legkodymov.name${path}</loc>`), path);
  assert.ok(!xml.includes("/apps/uci-srpski/privacy/"));
});
