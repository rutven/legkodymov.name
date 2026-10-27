import { z } from "astro/zod";

const platformKinds = ["web", "android", "telegram"] as const;
export type PlatformKind = (typeof platformKinds)[number];

const hostedSchema = z.object({ hosted: z.literal(true), body: z.string().min(1) });

export const appEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  order: z.number(),
  operator: z.string().min(1),
  platforms: z.array(z.object({ kind: z.enum(platformKinds), url: z.string().url().optional() })).min(1),
  supportEmail: z.string().email(),
  privacy: z.union([z.object({ url: z.string().url() }), hostedSchema]),
  deletion: z.union([z.object({ url: z.string().url() }), hostedSchema, z.object({ note: z.string().min(1) })]),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
});

export type AppEntry = z.infer<typeof appEntrySchema>;

export type ResolvedApp = {
  platforms: { label: string; href: string | null; comingSoon: boolean }[];
  privacyHref: string;
  deletion: { href: string } | { note: string };
  supportHref: string;
};

const platformLabels: Record<PlatformKind, string> = {
  web: "Web",
  android: "Google Play",
  telegram: "Telegram",
};

export const hostedPrivacyPath = (slug: string) => `/apps/${slug}/privacy/`;
export const hostedDeletionPath = (slug: string) => `/apps/${slug}/delete-account/`;

export function resolveApp(app: AppEntry): ResolvedApp {
  const { deletion } = app;
  return {
    platforms: app.platforms.map((p) => ({
      label: platformLabels[p.kind],
      href: p.url ?? null,
      comingSoon: !p.url,
    })),
    privacyHref: "url" in app.privacy ? app.privacy.url : hostedPrivacyPath(app.slug),
    deletion:
      "url" in deletion
        ? { href: deletion.url }
        : "hosted" in deletion
          ? { href: hostedDeletionPath(app.slug) }
          : { note: deletion.note },
    supportHref: `mailto:${app.supportEmail}`,
  };
}
