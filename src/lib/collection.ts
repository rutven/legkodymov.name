import { getCollection } from "astro:content";
import type { AppEntry } from "./apps";

export async function getApps(): Promise<AppEntry[]> {
  const entries = await getCollection("apps");
  return entries.map((e) => e.data).sort((a, b) => a.order - b.order);
}
