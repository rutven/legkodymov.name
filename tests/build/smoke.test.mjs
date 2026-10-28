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

test("only third-party script is the Cloudflare Web Analytics beacon", () => {
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /static\.cloudflareinsights\.com\/beacon\.min\.js/);
  assert.doesNotMatch(html, /googletagmanager/);
});

test("pages declare canonical URL on the apex domain", () => {
  assert.match(readFileSync("dist/index.html", "utf8"), /<link rel="canonical" href="https:\/\/legkodymov\.name\/"/);
  assert.match(
    readFileSync("dist/apps/uci-srpski/index.html", "utf8"),
    /<link rel="canonical" href="https:\/\/legkodymov\.name\/apps\/uci-srpski\/"/,
  );
});
