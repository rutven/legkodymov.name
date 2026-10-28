import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { appEntrySchema } from "./lib/apps";

const pattern = process.env.INCLUDE_FIXTURES === "1" ? "*.json" : "[!_]*.json";

const apps = defineCollection({
  loader: glob({ pattern, base: "./src/content/apps" }),
  schema: appEntrySchema,
});

export const collections = { apps };
