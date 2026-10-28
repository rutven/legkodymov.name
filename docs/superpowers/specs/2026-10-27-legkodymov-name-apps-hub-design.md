# legkodymov.name — apps hub, Cloudflare move, Play account

_Date: 2026-10-27 · Owner: Sergei Legkodymov (rutven@gmail.com)_

## Intent

Sergei is registering a **personal Google Play developer account** to publish his apps, starting with **Uči Srpski** (repos `word-learn` = Spring/Vaadin web backend at `ucisrpski.app`, `word-learn-android` = Android client, package `app.ucisrpski`). Play needs a credible developer website, a developer contact email, and per-app public privacy-policy, account-deletion and support URLs.

`legkodymov.name` becomes that developer website: a small catalog of his apps and services. Each app has a stable page with links to its store listing, its own site, privacy policy, account deletion info and support. Today the domain is a one-line Jekyll/GitHub Pages page with broken HTTPS.

## Goals

1. `legkodymov.name` DNS on Cloudflare; HTTPS works.
2. Site rebuilt and hosted on Cloudflare; GitHub Pages retired.
3. `apps@legkodymov.name` receives mail (forwards to rutven@gmail.com) — used as Play developer account email.
4. `support@ucisrpski.app` receives mail (forwards to rutven@gmail.com) — Uči Srpski's support address everywhere.
5. Uči Srpski has public privacy and account-deletion URLs on `ucisrpski.app`, linked from legkodymov.name.
6. Play account registered with apps@ email + legkodymov.name website.

## Non-goals

- Transferring the domain registration away from Name.com (later, separate; check Cloudflare Registrar `.name` support first).
- Sending mail as apps@/support@ (receive-only forwarding; replies from Gmail).
- Translations now (English only; structure must allow more languages later).
- Organization Play account / D-U-N-S.
- Publishing Uči Srpski to production (this ends at account + listing readiness).

## Anti-goals

- Breaking `ucisrpski.app` (site, API, Google Sign-In) while touching its zone — Email Routing adds MX/TXT records; must not clobber existing records.
- Losing mail sent to `ucisrpski@outlook.com` during the switch.
- Privacy/deletion pages that contradict actual app behavior.
- Duplicate sources of truth: an app with its own site keeps its policy there; legkodymov.name only links.

## Current state (verified 2026-10-27)

- Registrar: Name.com, registered 2012-12-21, **expires 2026-12-21**, status `client transfer prohibited`.
- DNS: DigitalOcean (ns1–3.digitalocean.com). Only records: apex A `192.30.252.153`, `192.30.252.154` (retired GitHub Pages IPs). No MX, TXT, AAAA, www.
- HTTP 200; HTTPS fails (cert name mismatch).
- Repo `legkodymov.github.io`: `README.md` ("Welcome to Sergey Legkodymov personal page"), `_config.yml` (cayman theme), `CNAME`, `CLAUDE.md`.
- Cloudflare account (`a33e00431dfa82b8ad5b8a3b7c592b75`) zones: apartio.rs, meridianproperties.uk, rently.rs, **ucisrpski.app** (all active). `cf` CLI v0.15.0 installed and logged in.
- Uči Srpski:
  - `https://ucisrpski.app/privacy` live (200), `PrivacyPolicyView.java`, last updated 2026-10-25. Mentions Google Sign-In + optional Google Analytics (website, consent banner).
  - Contact: `AppFooter.CONTACT_EMAIL = "ucisrpski@outlook.com"`.
  - In-app deletion: Account settings → "Delete My Account" (`AccountSettingsView.java`) — permanently deletes account + data.
  - No public account-deletion page.
  - Dictionary entry AI suggestions send user-typed words to OpenRouter (`OpenRouterAiEntrySuggestionService`); policy doesn't mention it and says learning data isn't shared with third parties.
  - Android `docs/privacy-policy.md` (2026-07-21) is stale vs live policy, has `VERIFY` placeholders; `docs/play-data-safety.md` too. `docs/release-checklist.md` step 0 = Play Console registration.

## Decisions (Sergei's)

- legkodymov.name **lists apps and links** to policies on each app's own site; it **hosts** policies only for apps without a site (path like `/apps/<slug>/privacy`).
- Layout **B**: home page with one tile per app → per-app page (description, features, screenshots, store + website links, privacy, delete account, support).
- English first; other languages later.
- Uči Srpski delete-account info page lives on **ucisrpski.app** (`/delete-account`), next to `/privacy`.
- `apps@legkodymov.name` → rutven@gmail.com.
- Uči Srpski support = **`support@ucisrpski.app`** → rutven@gmail.com; replaces `ucisrpski@outlook.com`.
- Move **DNS only** to Cloudflare now.
- Hosting: Cloudflare **Workers with static assets** (not Pages), static-site generator **Astro**, deploy via `cf`; same GitHub repo.
- Play: **personal** account, no monetization now (no payments profile; if monetized later: add payments profile + public address).
- Name everywhere (site header, delete-account page, policy, Play): **Sergei Legkodymov** (matches legal ID). README's "Sergey" is outdated.
- Deploy: local `cf deploy` for now (my call); CI later.
- Terms per `GLOSSARY.md`: everything listed is an **App** with one or more **Platforms** (web, Android); no separate "service" category.
- Launch Apps: **Uči Srpski** and **Apartio**.
  - Apartio (repo `pet/rentals-platform`): Serbian rental listings aggregator. Platforms: Web (`search.apartio.rs`) + Telegram bot. Landing `apartio.rs`. Linked policy `https://search.apartio.rs/privacy`. No Deletion page (not on a store): App page says "delete in Account settings on search.apartio.rs". Support → `support@apartio.rs` (replaces `apartio-team@outlook.com` in `search-ui/app/utils/legal.ts`, landing pages, Nominatim UA; Outlook keeps forwarding). Operator in its policy: "Sergei Legkodymov PR Beograd", PIB 114227088.
  - apartio.rs mail: no MX; TXT `v=spf1 -all`; DMARC `p=reject`; Resend on `send.` subdomain. Email Routing replaces apex SPF with Cloudflare's; leave `send.` and DMARC untouched.
- URLs: English unprefixed; future languages under `/<lang>/`.
- Old Outlook inboxes (`ucisrpski@`, `apartio-team@`): forward to Gmail indefinitely; removed from all public pages.
- Repo renamed `legkodymov.github.io` → `legkodymov.name` after GitHub Pages off.
- Play account stays **personal** for now (organization under the PR possible later).
- Site analytics: **Cloudflare Web Analytics** (cookieless, no banner). `/privacy` page: aggregate cookieless stats via Cloudflare, no personal data.
- Operators: Apartio = "Sergei Legkodymov PR Beograd" (keep copyright + policy as is). legkodymov.name and Uči Srpski = "Sergei Legkodymov". Changing Apartio to personal only if the business stops (then policy, PIB, payments move too).
- App page path: `/apps/<ascii-slug>/` (e.g. `/apps/uci-srpski/`).
- Play public developer name: "Sergei Legkodymov".
- Support address rule: App with own domain → `support@<domain>`; else Developer email.
- Home: name, one-line intro, App tiles, Developer email. No CV/blog (for now).
- Platform not yet published (e.g. Android before Play listing) shows "coming soon", no link.
- Deletion requests by email: only from the account's address; done within 30 days.

## Workstreams (in order)

### 1. DNS + email (legkodymov.name, ucisrpski.app)

- Add zone `legkodymov.name` (free plan) via `cf`. Don't import the stale GitHub A records.
- ucisrpski.app has no MX/TXT today (checked) — Email Routing adds records, nothing replaced.
- Sergei switches nameservers at Name.com to the two Cloudflare-assigned ones; wait for zone `active`.
- Enable Email Routing on legkodymov.name; destination rutven@gmail.com (Sergei clicks Cloudflare's verification email); rule `apps@` → destination. Let Cloudflare add its MX/SPF records.
- On ucisrpski.app: first list existing DNS records (esp. any MX/TXT/SPF) and confirm with Sergei; then enable Email Routing, rule `support@` → rutven@gmail.com.
- On apartio.rs: enable Email Routing, rule `support@` → rutven@gmail.com (SPF note above).
- Sergei enables forwarding in Outlook for `ucisrpski@outlook.com` and `apartio-team@outlook.com` → rutven@gmail.com; keep the mailboxes.
- Verify: test mail to both addresses arrives in Gmail (check spam).
- All writes: `--dry-run` first, then confirm with Sergei.

### 2. Site (this repo)

- Replace Jekyll with Astro static output; delete `_config.yml`, `CNAME` once cut over.
- Content model: one data entry per app (slug, name, tagline, description, platforms, store URL, website URL, privacy URL **or** hosted policy, delete-account URL **or** hosted instructions, support email, screenshots). Adding an app = adding an entry + images.
- Pages: `/` (header with Sergei's name, app tiles, contact apps@legkodymov.name), `/apps/<slug>/`, optional hosted `/apps/<slug>/privacy` and `/apps/<slug>/delete-account`.
- i18n-ready: locale-aware routing/strings structure even with only `en`.
- No cookies; only third-party script is Cloudflare Web Analytics beacon.
- Neutral design, independent of Uči Srpski's parchment/gold brand.
- First entry: **Uči Srpski** (Web + Android, single entry). Links: website `https://ucisrpski.app`, privacy `https://ucisrpski.app/privacy`, delete `https://ucisrpski.app/delete-account`, support `support@ucisrpski.app`, Play link once listed (hide until then).
- Deploy as Worker (static assets) with custom domain `legkodymov.name`; add `www` → apex redirect.
- Turn off GitHub Pages for the repo after Cloudflare serves the site over HTTPS.
- Update this repo's `CLAUDE.md` with new commands.

### 3. Uči Srpski (word-learn, word-learn-android)

Backend (`word-learn`):
- New public route `/delete-account` (like `PrivacyPolicyView`, `@AnonymousAllowed`, linked in `AppFooter`): app name "Uči Srpski", developer name, steps (sign in → Account settings → Delete My Account), what is deleted (account + all learning data, permanent), alternative: email support@ucisrpski.app from the account's email, timeframe: immediate from live service, removed from backups within **60 days** (Sergei confirmed).
- Backups (checked 2026-10-28): server `RETAIN_DAYS=7`; B2 bucket lifecycle `[]`, 216 daily dumps since 2026-03-13 — deleted users' data kept indefinitely today. Applying the rule removes ~156 old dumps (Sergei to confirm none needed) — B2 lifecycle **applied 2026-10-28**: hide after 59 days + delete 1 day later = gone by day 60 (bucket-wide, prefix ""). Restore procedure (`docs/deployment.md` §8) must re-apply deletions made after the backup date.
- `CONTACT_EMAIL` → `support@ucisrpski.app`.
- Privacy policy: name the Operator (Sergei Legkodymov) and processors — OpenRouter (AI word suggestions), Hetzner (hosting), Backblaze (backups, 60 days); bump date. Currently names none of these.

Android (`word-learn-android`):
- Support email → `support@ucisrpski.app` (Settings screen, `docs/store-listing.md`).
- Settings: link to `https://ucisrpski.app/delete-account` (and privacy if not present).
- Rewrite `docs/privacy-policy.md` to mirror live policy (or point to it as source of truth); resolve `VERIFY`s in `docs/play-data-safety.md` (deletion mechanism, support email, OpenRouter).
- `docs/release-checklist.md`: add deletion URL gate.

Apartio (`rentals-platform`): replace `apartio-team@outlook.com` with `support@apartio.rs` (`search-ui/app/utils/legal.ts`, landing pages, Nominatim UA).

Each repo uses its own CLAUDE.md, branch + PR workflow.

### 4. Play account (Sergei, assisted)

- Register personal developer account ($25): developer email `apps@legkodymov.name`, website `https://legkodymov.name`, identity verification.
- Prepare a checklist: account fields, closed test requirement (≥12 testers opted in for 14 continuous days before production access), Uči Srpski app entry values (privacy URL, deletion URL, support email, data safety from updated doc).

## Left to the builder

- Astro project structure, styling, component breakdown, image formats.
- Exact `cf` commands (discover with `cf --help` / `cf schema`; `cf cli search` is unavailable in v0.15.0).
- Wording of the delete-account page and policy updates (Sergei reviews before merge).
- Whether to also add AAAA/IPv6 or other zone settings (sensible defaults: SSL Full/strict-equivalent, Always Use HTTPS).

## Risks

- Renewal 2026-12-21 at Name.com — remind Sergei; unrelated to DNS move but easy to miss.
- Email Routing on ucisrpski.app conflicts with any existing MX — check first.
- Play may reject deletion URL if it doesn't name the app/developer as on the listing — keep names identical.
