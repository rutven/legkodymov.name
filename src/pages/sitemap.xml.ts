import type { APIRoute } from "astro";
import { getApps, hostedPagePaths } from "../lib/collection";

export const GET: APIRoute = async ({ site }) => {
  const apps = await getApps();
  const hosted = async (page: "privacy" | "deletion", suffix: string) =>
    (await hostedPagePaths(page)).map((p) => `/apps/${p.params.slug}/${suffix}/`);
  const paths = [
    "/",
    "/privacy/",
    ...apps.map((app) => `/apps/${app.slug}/`),
    ...(await hosted("privacy", "privacy")),
    ...(await hosted("deletion", "delete-account")),
  ];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
