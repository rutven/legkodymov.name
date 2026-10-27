# legkodymov.name — DNS, Email Routing, Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** legkodymov.name on Cloudflare DNS, Email Routing for apps@/support@ addresses on three zones, and a new Astro site (home + App pages) deployed as a Cloudflare Worker replacing GitHub Pages.

**Architecture:** Cloudflare changes are made with the `cf` CLI (`--dry-run` first, Sergei confirms every write). The site is a static Astro build; App data lives in one JSON file per App validated by a zod schema; a pure `resolveApp()` function turns an entry into display links and is unit-tested; build output is tested with `node:test` against `dist/`. `cf init .` wires the Astro project to Workers static assets; `cf deploy` publishes it with custom domain `legkodymov.name`.

**Tech Stack:** Astro 7.x (static output, built-in i18n), TypeScript, zod (via `astro:content`), Vitest (unit), `node:test` (build output), `cf` CLI v0.15.0, Cloudflare Workers static assets, Cloudflare Email Routing, Cloudflare Web Analytics.

**Spec:** `docs/superpowers/specs/2026-10-27-legkodymov-name-apps-hub-design.md` · Glossary: `GLOSSARY.md` · ADR: `docs/adr/0001-policies-live-on-app-sites.md`

**Out of scope (separate plans, in their repos):** word-learn backend (`/delete-account`, support email, policy update), word-learn-android (support email, Settings links, docs), rentals-platform (support email swap), Play account checklist.

## Global Constraints

- Developer name everywhere: **Sergei Legkodymov** (never "Sergey").
- Developer email: `apps@legkodymov.name`. Forward destination for all routes: `rutven@gmail.com`.
- Support addresses: Uči Srpski `support@ucisrpski.app`; Apartio `support@apartio.rs`.
- Cloudflare account id: `a33e00431dfa82b8ad5b8a3b7c592b75`. Registrar stays Name.com (expires 2026-12-21) — DNS only.
- Every Cloudflare write: run with `--dry-run`, show Sergei, run for real only after his OK. Destructive `cf` commands without `--force` print `Aborted.` and exit 0 — check stderr, not exit code.
- `cf cli search` doesn't exist in v0.15.0; discover commands with `cf <group> --help` and `cf schema <cmd>`.
- English URLs unprefixed; future locales under `/<lang>/` (Astro i18n `prefixDefaultLocale: false`).
- App page path `/apps/<ascii-slug>/`. Slugs: `uci-srpski`, `apartio`.
- No cookies. Only third-party script: Cloudflare Web Analytics beacon.
- Neutral design, not Uči Srpski's parchment/gold. Must work at 360px width without horizontal scroll.
- Policies: link out when the App has a site (ADR 0001); host at `/apps/<slug>/privacy` only when it doesn't.
- Platform without a public URL renders "coming soon", no link.
- Commits: concise, end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work on branch `apps-hub`.

## Review Focus

1. **Email Routing on a zone with a strict SPF** (apartio.rs `v=spf1 -all`, DMARC `p=reject`): routing must replace the apex SPF, leave `send.apartio.rs` and `_dmarc` untouched, and a test mail to `support@apartio.rs` must arrive — Task 2 verification.
2. **App with no site of its own** (none at launch): hosted policy and Deletion page routes must render — Task 4 fixture test + Task 5 build test.
3. **Platform not yet published** (Uči Srpski Android): "coming soon" text, no `href` — Task 4 unit test, Task 5 build test.
4. **`www.legkodymov.name` and `http://`**: must 301 to `https://legkodymov.name/...` preserving path — Task 7 verification.
5. **Unknown path** (`/apps/nope/`): must return the site's 404 page with status 404, not a blank or the home page — Task 5 build test + Task 7 curl.

---

### Task 1: Move legkodymov.name DNS to Cloudflare

**Files:** none (account change). Record results in the PR description.

- [ ] **Step 1: Find the zone-create command and its shape**

Run: `cf zones --help` and `cf schema zones create`
Expected: shows `name`, `account.id`, `type` (full).

- [ ] **Step 2: Dry-run zone creation**

Run: `cf zones create --name legkodymov.name --account-id a33e00431dfa82b8ad5b8a3b7c592b75 --type full --dry-run` (adjust flags to Step 1 output)
Expected: JSON request body printed, nothing sent. Show Sergei.

- [ ] **Step 3: Create the zone (after Sergei's OK) and capture nameservers**

Run the same without `--dry-run`, then: `cf zones list --name legkodymov.name | jq '.[0] | {id,status,name_servers}'`
Expected: `status: "pending"`, two `*.ns.cloudflare.com` nameservers. Do **not** add the old `192.30.252.x` A records.

- [ ] **Step 4: Sergei switches nameservers at Name.com**

Give Sergei the two nameservers; he replaces `ns1–3.digitalocean.com` in Name.com → Domain → Nameservers. (Leave the DigitalOcean DNS zone until Task 7 passes.)

- [ ] **Step 5: Verify activation**

Run: `dig +short NS legkodymov.name` and `cf zones list --name legkodymov.name | jq -r '.[0].status'`
Expected: Cloudflare nameservers; status `active` (can take minutes to hours — re-check, don't block other tasks; Tasks 3–6 don't need it).

- [ ] **Step 6: Zone settings**

Dry-run then apply: SSL mode `full`, Always Use HTTPS `on` (find via `cf zones settings --help`).
Expected: `cf` returns updated values.

### Task 2: Email Routing — apps@legkodymov.name, support@ucisrpski.app, support@apartio.rs

**Files:** none (account change).

**Interfaces:** Consumes: active `legkodymov.name` zone (Task 1 Step 5). The ucisrpski.app and apartio.rs parts can run before that.

- [ ] **Step 1: Snapshot existing DNS of both app zones**

Run: `cf dns records list --zone ucisrpski.app | jq '[.[]|{type,name,content}]'` and same for `apartio.rs`. Save output to the scratchpad.
Expected: ucisrpski.app has no MX/TXT; apartio.rs has TXT `v=spf1 -all`, `_dmarc` TXT, `send.apartio.rs` MX/TXT (Resend). Show Sergei; stop if anything else mail-related appears.

- [ ] **Step 2: Add destination address**

Find command: `cf email-routing --help`. Dry-run, then create destination `rutven@gmail.com` on the account.
Expected: destination `verified: null`. Sergei clicks the verification link in Gmail; re-list → verified.

- [ ] **Step 3: Enable Email Routing on ucisrpski.app + rule support@**

Dry-run, then enable routing for zone `ucisrpski.app` (lets Cloudflare add its MX + SPF) and create rule: match `to = support@ucisrpski.app` → forward `rutven@gmail.com`.
Expected: routing status `ready`; `dig +short MX ucisrpski.app` shows `route{1,2,3}.mx.cloudflare.net`.

- [ ] **Step 4: Enable Email Routing on apartio.rs + rule support@**

Before enabling, dry-run shows Cloudflare's intended SPF. Replace the apex `v=spf1 -all` TXT with Cloudflare's `v=spf1 include:_spf.mx.cloudflare.net ~all` (exactly one SPF record must remain). Don't touch `_dmarc` or `send.` records. Rule: `support@apartio.rs` → `rutven@gmail.com`.
Expected: `dig +short TXT apartio.rs` → one SPF with `_spf.mx.cloudflare.net`; `dig +short TXT _dmarc.apartio.rs` unchanged; `dig +short MX send.apartio.rs` unchanged.

- [ ] **Step 5: Enable Email Routing on legkodymov.name + rule apps@** (after Task 1 Step 5)

Same as Step 3 for `apps@legkodymov.name`.

- [ ] **Step 6: Outlook forwarding (Sergei)**

Sergei enables forwarding to `rutven@gmail.com` in `ucisrpski@outlook.com` and `apartio-team@outlook.com` (Outlook → Settings → Mail → Forwarding, keep a copy).

- [ ] **Step 7: Verify delivery**

Sergei sends a mail from a non-Gmail account (Gmail drops self-forwarded copies) to each of `apps@legkodymov.name`, `support@ucisrpski.app`, `support@apartio.rs`, `ucisrpski@outlook.com`, `apartio-team@outlook.com`.
Expected: all five in rutven@gmail.com inbox (check spam). Also confirm Apartio's outgoing mail still works: trigger one magic-link email at search.apartio.rs → arrives.

### Task 3: Astro project replacing Jekyll

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/layouts/Base.astro`, `src/pages/index.astro`, `src/styles/global.css`, `vitest.config.ts`, `tests/build/smoke.test.mjs`, `cloudflare.config.ts` (generated by `cf init`)
- Delete: `_config.yml`
- Keep: `CNAME` until Task 7; `README.md` (rewrite in Task 7)

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string; lang?: string }` (default `lang="en"`); npm scripts `dev`, `build`, `test` (`vitest run`), `test:build` (`npm run build && node --test tests/build`).

- [ ] **Step 1: Scaffold**

Run: `npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --yes` then `npm i` and `npm i -D vitest cf`.
Expected: `npm run build` produces `dist/index.html`.

- [ ] **Step 2: Configure Astro**

`astro.config.mjs`: `site: "https://legkodymov.name"`, `output: "static"`, `trailingSlash: "always"`, `i18n: { locales: ["en"], defaultLocale: "en", routing: { prefixDefaultLocale: false } }`.

- [ ] **Step 3: Write the failing build smoke test** — `tests/build/smoke.test.mjs`

```js
test("home page is UTF-8 English with developer name", () => {
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<meta charset="utf-8"/i);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(html, /Sergei Legkodymov/);
  assert.doesNotMatch(html, /Sergey/);
});
```

- [ ] **Step 4: Run to see it fail**

Run: `npm run test:build`
Expected: FAIL on `Sergei Legkodymov` (minimal template).

- [ ] **Step 5: Implement `Base.astro` + `global.css` + minimal `index.astro`**

Base: doctype, charset, viewport, `<title>`, meta description, `<header>` with "Sergei Legkodymov" linking to `/`, `<main><slot/></main>`, `<footer>` with `© {year} Sergei Legkodymov`, `apps@legkodymov.name` mailto, link to `/privacy/`. CSS: system font stack, max-width ~720px, 16px side padding, light/dark via `prefers-color-scheme`.

- [ ] **Step 6: Run tests** — `npm run test:build` → PASS.

- [ ] **Step 7: Wire to Cloudflare**

Run: `npx cf init .` — review generated `cloudflare.config.ts`; set `worker.name: "legkodymov-name"`. Then `npx cf build`.
Expected: `.cloudflare/output/v0/` contains static assets. Add `.cloudflare/`, `dist/`, `node_modules/`, `.astro/` to `.gitignore`. Delete `_config.yml`.

- [ ] **Step 8: Commit** — `feat: astro site skeleton on cloudflare workers`

### Task 4: App data model and link resolver

**Files:**
- Create: `src/content.config.ts`, `src/lib/apps.ts`, `tests/unit/apps.test.ts`

**Interfaces:**
- Produces (in `src/lib/apps.ts`):
  - `type PlatformKind = "web" | "android" | "telegram"`
  - `type AppEntry` = zod-inferred: `{ slug: string; name: string; tagline: string; description: string; order: number; operator: string; platforms: { kind: PlatformKind; url?: string }[]; supportEmail: string; privacy: { url: string } | { hosted: true; body: string }; deletion: { url: string } | { hosted: true; body: string } | { note: string }; icon?: string; screenshots?: string[] }`
  - `appEntrySchema` (zod) — exported, used by `content.config.ts` for collection `apps` (glob loader over `src/content/apps/*.json`; `slug` must match `/^[a-z0-9-]+$/`).
  - `resolveApp(app: AppEntry): ResolvedApp` where `ResolvedApp = { platforms: { label: string; href: string | null; comingSoon: boolean }[]; privacyHref: string; deletion: { href: string } | { note: string }; supportHref: string }`
  - Labels: `web → "Web"`, `android → "Google Play"`, `telegram → "Telegram"`.
  - Hosted hrefs: `/apps/<slug>/privacy/`, `/apps/<slug>/delete-account/`. `supportHref = "mailto:" + supportEmail`.

- [ ] **Step 1: Write failing tests** — `tests/unit/apps.test.ts`

```ts
it("links out when privacy url given", () =>
  expect(resolveApp(fx({ privacy: { url: "https://ucisrpski.app/privacy" } })).privacyHref).toBe("https://ucisrpski.app/privacy"));
it("hosts privacy when app has no site", () =>
  expect(resolveApp(fx({ slug: "demo", privacy: { hosted: true, body: "x" } })).privacyHref).toBe("/apps/demo/privacy/"));
it("hosted deletion page path", () =>
  expect(resolveApp(fx({ slug: "demo", deletion: { hosted: true, body: "x" } })).deletion).toEqual({ href: "/apps/demo/delete-account/" }));
it("deletion note passes through", () =>
  expect(resolveApp(fx({ deletion: { note: "Delete in Account settings on search.apartio.rs" } })).deletion).toEqual({ note: "Delete in Account settings on search.apartio.rs" }));
it("platform without url is coming soon with no href", () =>
  expect(resolveApp(fx({ platforms: [{ kind: "android" }] })).platforms[0]).toEqual({ label: "Google Play", href: null, comingSoon: true }));
it("support is a mailto", () =>
  expect(resolveApp(fx({ supportEmail: "support@ucisrpski.app" })).supportHref).toBe("mailto:support@ucisrpski.app"));
it("schema rejects non-ascii slug", () =>
  expect(appEntrySchema.safeParse(raw({ slug: "uči-srpski" })).success).toBe(false));
it("schema rejects entry with neither privacy url nor hosted", () =>
  expect(appEntrySchema.safeParse(raw({ privacy: {} })).success).toBe(false));
```

`fx(overrides)` = a valid `AppEntry` with overrides; `raw(overrides)` = same as plain object. Define both in the test file.

- [ ] **Step 2: Run** — `npm test` → FAIL (module missing).
- [ ] **Step 3: Implement `appEntrySchema`, `resolveApp`, and `content.config.ts`.**
- [ ] **Step 4: Run** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `feat: app data model and link resolver`

### Task 5: Pages — home, App page, hosted policy/deletion, site privacy, 404

**Files:**
- Create: `src/components/AppTile.astro`, `src/pages/apps/[slug]/index.astro`, `src/pages/apps/[slug]/privacy.astro`, `src/pages/apps/[slug]/delete-account.astro`, `src/pages/privacy.astro`, `src/pages/404.astro`, `src/content/apps/_fixture-demo.json` (test-only, see Step 1), `tests/build/pages.test.mjs`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getCollection("apps")`, `resolveApp()`, `Base.astro` (Tasks 3–4).
- `privacy.astro` / `delete-account.astro` `getStaticPaths` emit only Apps whose `privacy`/`deletion` is `{ hosted: true }`. Fixture `demo` (hosted both, Android coming soon) is included only when `process.env.INCLUDE_FIXTURES === "1"` (filter in a `getApps()` helper in `src/lib/apps.ts`; production build excludes it).

- [ ] **Step 1: Write failing build tests** — `tests/build/pages.test.mjs` (run with `INCLUDE_FIXTURES=1`)

```js
test("home lists app tiles sorted by order", () => {
  const html = read("dist/index.html");
  assert.ok(html.indexOf("Uči Srpski") < html.indexOf("Apartio"));
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
test("404 page exists", () => assert.ok(existsSync("dist/404.html")));
```

Fixture `_fixture-demo.json`: slug `demo`, name `Demo App`, order 99, platforms `[{ "kind": "android" }]`, privacy+deletion hosted, support `apps@legkodymov.name`. Task 6 supplies the real entries; until then the first test fails — expected.

- [ ] **Step 2: Run** — `INCLUDE_FIXTURES=1 npm run test:build` → FAIL.

- [ ] **Step 3: Implement pages.**
  - Home: intro line "Apps by Sergei Legkodymov." + one sentence (builder's wording); grid of `AppTile` (icon or first-letter tile, name, tagline) sorted by `order`; Developer email.
  - App page (layout B): name, tagline, description, screenshots if any, platform list (`href` or "coming soon"), links block: Privacy policy, Delete account (link or note), Support (mailto). Linked policies get `rel="noopener"` and an ↗ marker.
  - Hosted pages render `body` (Markdown via `marked` or Astro's `<Content>` — builder's call).
  - `/privacy/` copy (fixed): "This site doesn't use cookies and doesn't collect personal data. It's hosted on Cloudflare, which keeps standard request logs, and uses Cloudflare Web Analytics for cookieless, aggregate visit statistics. Each app listed here has its own privacy policy, linked from its page. Questions: apps@legkodymov.name."
  - `404.astro`: "Page not found" + link home.

- [ ] **Step 4: Run** — fixture tests pass except the home ordering test (needs Task 6).
- [ ] **Step 5: Commit** — `feat: home, app, hosted policy, privacy and 404 pages`

### Task 6: Content — Uči Srpski and Apartio

**Files:**
- Create: `src/content/apps/uci-srpski.json`, `src/content/apps/apartio.json`, `public/apps/uci-srpski/icon.png` (copy of `/home/sergei/workspace/pet/word-learn-android/store/play-icon-512.png`)

- [ ] **Step 1: Write entries** with these exact values:
  - **uci-srpski**: name `Uči Srpski`, tagline `Learn Serbian vocabulary with spaced repetition.`, order 1, operator `Sergei Legkodymov`, platforms `[{web, https://ucisrpski.app}, {android}]`, privacy `{ url: "https://ucisrpski.app/privacy" }`, deletion `{ url: "https://ucisrpski.app/delete-account" }`, support `support@ucisrpski.app`, icon `/apps/uci-srpski/icon.png`. Description: 2–3 sentences from `word-learn/README.MD` / `docs/01_product.md` (personal deck from shared dictionary, FSRS spaced repetition, web + Android).
  - **apartio**: name `Apartio`, tagline `Apartment discovery for Serbia.`, order 2, operator `Sergei Legkodymov PR Beograd`, platforms `[{web, https://search.apartio.rs}, {telegram, https://t.me/apartio_rs_bot}]`, privacy `{ url: "https://search.apartio.rs/privacy" }`, deletion `{ note: "Delete your account in Account settings on search.apartio.rs." }`, support `support@apartio.rs`, no icon. Description: 2–3 sentences (aggregates rental listings from Serbian sites, dedupes and translates, delivers matches via web and Telegram).
  - App page shows operator line for Apartio only when it differs from the Developer: "Operated by Sergei Legkodymov PR Beograd".

- [ ] **Step 2: Run** — `INCLUDE_FIXTURES=1 npm run test:build` and `npm test` → all PASS. Also `npm run build` (no fixtures) → `dist/apps/demo` absent.

- [ ] **Step 3: Note the dependency** — `ucisrpski.app/delete-account` returns 404 until the word-learn plan ships it; record in PR description; don't block deploy.

- [ ] **Step 4: Visual check** — `npx cf dev`, open home + both App pages at 360px and desktop widths; no horizontal scroll, "Uči" renders correctly, dark mode readable.

- [ ] **Step 5: Commit** — `feat: add Uči Srpski and Apartio`

### Task 7: Analytics, deploy, cut-over from GitHub Pages

**Files:**
- Modify: `cloudflare.config.ts` (domains), `src/layouts/Base.astro` (beacon), `README.md`, `CLAUDE.md`
- Delete: `CNAME`

**Interfaces:** Consumes: active zone (Task 1), built site (Tasks 3–6).

- [ ] **Step 1: Web Analytics site**

Find command (`cf --help` → web analytics / `rum`), dry-run, create site for host `legkodymov.name`; capture its token. Add to `Base.astro` before `</body>`: `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"<TOKEN>"}'></script>`. Add build test assertion that `dist/index.html` contains `static.cloudflareinsights.com/beacon.min.js` and no `googletagmanager`.

- [ ] **Step 2: Custom domains**

In `cloudflare.config.ts` set `worker.domains: ["legkodymov.name", "www.legkodymov.name"]` (check object form via `npx cf deploy --dry-run` output). Add a Redirect Rule on the zone: host `www.legkodymov.name` → `https://legkodymov.name${path}` 301, query preserved (dry-run first).

- [ ] **Step 3: Deploy**

Run: `npx cf deploy --dry-run`, show Sergei, then `npx cf deploy --message "apps hub v1"`.
Expected: version deployed; domains attached.

- [ ] **Step 4: Verify live**

```bash
curl -sI https://legkodymov.name/ | head -1                       # HTTP/2 200
curl -sI http://legkodymov.name/apps/ | rg -i 'HTTP|location'      # 301 → https
curl -sI https://www.legkodymov.name/apps/uci-srpski/ | rg -i 'HTTP|location'  # 301 → https://legkodymov.name/apps/uci-srpski/
curl -s -o /dev/null -w '%{http_code}\n' https://legkodymov.name/apps/nope/    # 404
curl -s https://legkodymov.name/apps/uci-srpski/ | rg -c 'support@ucisrpski.app'  # ≥1
```

- [ ] **Step 5: Retire GitHub Pages and old DNS**

Delete `CNAME`; Sergei (or `gh api -X DELETE repos/rutven/legkodymov.github.io/pages` after his OK) disables Pages. Sergei deletes the legkodymov.name zone in DigitalOcean.

- [ ] **Step 6: Docs**

`README.md`: one-paragraph description + `npm run dev|build|test|test:build`, `npx cf deploy`. `CLAUDE.md`: replace Jekyll content with Astro/cf commands, content model pointer (`src/content/apps/*.json`, `src/lib/apps.ts`), and the Global Constraints that aren't obvious from code (Developer name spelling, ADR 0001, no cookies).

- [ ] **Step 7: Commit, PR, rename repo**

Commit `feat: deploy to cloudflare, retire github pages`; push `apps-hub`; open PR. After merge and Sergei's OK: `gh repo rename legkodymov.name -R rutven/legkodymov.github.io`; update local remote.
