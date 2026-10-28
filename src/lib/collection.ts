import { getCollection } from "astro:content";
import type { AppEntry } from "./apps";

export async function getApps(): Promise<AppEntry[]> {
  const entries = await getCollection("apps");
  return entries.map((e) => e.data).sort((a, b) => a.order - b.order);
}

export async function hostedPagePaths(page: "privacy" | "deletion") {
  const apps = await getApps();
  return apps.flatMap((app) => {
    const entry = app[page];
    return "hosted" in entry ? [{ params: { slug: app.slug }, props: { app, body: entry.body } }] : [];
  });
}
