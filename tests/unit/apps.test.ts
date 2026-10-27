import { describe, expect, it } from "vitest";
import { appEntrySchema, resolveApp, type AppEntry } from "../../src/lib/apps";

const base: AppEntry = {
  slug: "demo",
  name: "Demo",
  tagline: "A demo app",
  description: "Demo description.",
  order: 1,
  operator: "Sergei Legkodymov",
  platforms: [{ kind: "web", url: "https://demo.example" }],
  supportEmail: "support@demo.example",
  privacy: { url: "https://demo.example/privacy" },
  deletion: { url: "https://demo.example/delete-account" },
};

const fx = (overrides: Partial<AppEntry>): AppEntry => ({ ...base, ...overrides });
const raw = (overrides: Record<string, unknown>): Record<string, unknown> => ({ ...base, ...overrides });

describe("resolveApp", () => {
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
  it("platform labels", () =>
    expect(resolveApp(fx({ platforms: [{ kind: "web", url: "https://a.example" }, { kind: "telegram", url: "https://t.me/a" }] })).platforms.map((p) => p.label)).toEqual(["Web", "Telegram"]));
  it("support is a mailto", () =>
    expect(resolveApp(fx({ supportEmail: "support@ucisrpski.app" })).supportHref).toBe("mailto:support@ucisrpski.app"));
});

describe("appEntrySchema", () => {
  it("accepts a valid entry", () => expect(appEntrySchema.safeParse(raw({})).success).toBe(true));
  it("schema rejects non-ascii slug", () =>
    expect(appEntrySchema.safeParse(raw({ slug: "uči-srpski" })).success).toBe(false));
  it("schema rejects entry with neither privacy url nor hosted", () =>
    expect(appEntrySchema.safeParse(raw({ privacy: {} })).success).toBe(false));
});
