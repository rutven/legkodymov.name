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
  supportAddress: "support@demo.example",
  privacy: { url: "https://demo.example/privacy" },
  deletion: { url: "https://demo.example/delete-account" },
};

const entry = (overrides: Partial<AppEntry>): AppEntry => ({ ...base, ...overrides });
const rawEntry = (overrides: Record<string, unknown>): Record<string, unknown> => ({ ...base, ...overrides });

describe("resolveApp", () => {
  it("links out when privacy url given", () =>
    expect(resolveApp(entry({ privacy: { url: "https://ucisrpski.app/privacy" } })).privacy).toEqual({ href: "https://ucisrpski.app/privacy", external: true }));
  it("hosts privacy when app has no site", () =>
    expect(resolveApp(entry({ slug: "demo", privacy: { hosted: true, body: "x" } })).privacy).toEqual({ href: "/apps/demo/privacy/", external: false }));
  it("links out to deletion url", () =>
    expect(resolveApp(entry({ deletion: { url: "https://a.example/delete" } })).deletion).toEqual({ href: "https://a.example/delete", external: true }));
  it("hosted deletion page path", () =>
    expect(resolveApp(entry({ slug: "demo", deletion: { hosted: true, body: "x" } })).deletion).toEqual({ href: "/apps/demo/delete-account/", external: false }));
  it("deletion note passes through", () =>
    expect(resolveApp(entry({ deletion: { note: "Delete in Account settings on search.apartio.rs" } })).deletion).toEqual({ note: "Delete in Account settings on search.apartio.rs" }));
  it("website links out when given", () =>
    expect(resolveApp(entry({ website: "https://apartio.rs" })).website).toEqual({ href: "https://apartio.rs", external: true }));
  it("no website when not given", () => expect(resolveApp(entry({})).website).toBeNull());
  it("platform without url has no href", () =>
    expect(resolveApp(entry({ platforms: [{ kind: "android" }] })).platforms[0]).toEqual({ label: "Google Play", href: null }));
  it("platform labels", () =>
    expect(resolveApp(entry({ platforms: [{ kind: "web", url: "https://a.example" }, { kind: "telegram", url: "https://t.me/a" }] })).platforms.map((p) => p.label)).toEqual(["Web", "Telegram"]));
  it("support is a mailto", () =>
    expect(resolveApp(entry({ supportAddress: "support@ucisrpski.app" })).supportHref).toBe("mailto:support@ucisrpski.app"));
});

describe("appEntrySchema", () => {
  it("accepts a valid entry", () => expect(appEntrySchema.safeParse(rawEntry({})).success).toBe(true));
  it("schema rejects non-ascii slug", () =>
    expect(appEntrySchema.safeParse(rawEntry({ slug: "uči-srpski" })).success).toBe(false));
  it("schema rejects entry with neither privacy url nor hosted", () =>
    expect(appEntrySchema.safeParse(rawEntry({ privacy: {} })).success).toBe(false));
  it("schema rejects empty feature", () =>
    expect(appEntrySchema.safeParse(rawEntry({ features: [""] })).success).toBe(false));
});
