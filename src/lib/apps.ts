import { z } from "astro/zod";

const platformKinds = ["web", "android", "telegram"] as const;
export type PlatformKind = (typeof platformKinds)[number];

const hostedPageSchema = z.object({ hosted: z.literal(true), body: z.string().min(1) });

export const appEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string().min(1)).optional(),
  order: z.number(),
  operator: z.string().min(1),
  website: z.string().url().optional(),
  platforms: z.array(z.object({ kind: z.enum(platformKinds), url: z.string().url().optional() })).min(1),
  supportAddress: z.string().email(),
  privacy: z.union([z.object({ url: z.string().url() }), hostedPageSchema]),
  deletion: z.union([z.object({ url: z.string().url() }), hostedPageSchema, z.object({ note: z.string().min(1) })]),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
});

export type AppEntry = z.infer<typeof appEntrySchema>;

export type Link = { href: string; external: boolean };

export type ResolvedApp = {
  website: Link | null;
  platforms: { label: string; href: string | null }[];
  privacy: Link;
  deletion: Link | { note: string };
  supportHref: string;
};

const platformLabels: Record<PlatformKind, string> = {
  web: "Web",
  android: "Google Play",
  telegram: "Telegram",
};

export const hostedPrivacyPath = (slug: string) => `/apps/${slug}/privacy/`;
export const hostedDeletionPath = (slug: string) => `/apps/${slug}/delete-account/`;

const external = (href: string): Link => ({ href, external: true });
const internal = (href: string): Link => ({ href, external: false });

export function resolveApp(app: AppEntry): ResolvedApp {
  const { deletion } = app;
  return {
    website: app.website ? external(app.website) : null,
    platforms: app.platforms.map((p) => ({ label: platformLabels[p.kind], href: p.url ?? null })),
    privacy: "url" in app.privacy ? external(app.privacy.url) : internal(hostedPrivacyPath(app.slug)),
    deletion:
      "url" in deletion
        ? external(deletion.url)
        : "hosted" in deletion
          ? internal(hostedDeletionPath(app.slug))
          : { note: deletion.note },
    supportHref: `mailto:${app.supportAddress}`,
  };
}
