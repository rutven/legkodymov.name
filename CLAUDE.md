# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Developer site for Sergei Legkodymov at `legkodymov.name`: lists his Apps with links to their platforms, privacy policies, Deletion pages and Support addresses. Vocabulary: `GLOSSARY.md`. Design: `docs/superpowers/specs/2026-10-27-legkodymov-name-apps-hub-design.md`.

Static Astro build, deployed as an assets-only Cloudflare Worker (`wrangler.jsonc`, custom domains apex + www). DNS, Email Routing and Web Analytics for the zone are managed with the `cf` CLI; deploy uses Wrangler because `cf` v0.15 only deploys Astro via the SSR adapter.

## Commands

```
npm run dev
npm test                         # vitest, tests/unit
npx vitest run -t "<name>"       # single unit test
npm run test:build               # INCLUDE_FIXTURES=1 build + node:test over dist/ (tests/build)
npm run deploy                   # production build (no fixtures) + wrangler deploy
```

## Content model

- One JSON file per App in `src/content/apps/*.json`, validated by `appEntrySchema` in `src/lib/apps.ts`.
- `resolveApp()` (pure, unit-tested) turns an entry into display links; pages consume it.
- Files starting with `_` are test fixtures, loaded only when `INCLUDE_FIXTURES=1`.

## Rules

- Name is always "Sergei Legkodymov", never "Sergey".
- Policies and Deletion pages live on each App's own site; this site links to them and hosts one only when an App has no site (`docs/adr/0001-policies-live-on-app-sites.md`).
- No cookies. The only third-party script is the Cloudflare Web Analytics beacon.
- Must work at 360px width without horizontal scroll.
