import { developer } from "../lib/developer";

const en = {
  homeTitle: `${developer.name} — Apps`,
  homeDescription: `Apps by ${developer.name}, with their privacy policies and Support addresses.`,
  homeHeading: `Apps by ${developer.name}.`,
  homeLead: "Each app below has its own page with platforms, privacy policy, account deletion and support.",
  developerEmail: "Developer email",
  appTitle: (app: string) => `${app} — ${developer.name}`,
  operatedBy: (operator: string) => `Operated by ${operator}`,
  features: "Features",
  screenshot: (app: string) => `${app} screenshot`,
  getIt: "Get it",
  website: "Website",
  comingSoon: "coming soon",
  privacyAndSupport: "Privacy and support",
  privacyPolicy: "Privacy policy",
  deleteAccount: "Delete account",
  support: "Support",
  hostedPrivacyTitle: (app: string) => `${app} privacy policy`,
  hostedPrivacyDescription: (app: string) => `Privacy policy for ${app}.`,
  hostedDeletionTitle: (app: string) => `${app} account deletion`,
  hostedDeletionDescription: (app: string) => `How to delete your account in ${app}.`,
  sitePrivacyTitle: `Privacy — ${developer.name}`,
  sitePrivacyDescription: "Privacy notice for legkodymov.name.",
  sitePrivacyHeading: "Privacy",
  sitePrivacyBody:
    "This site doesn't use cookies and doesn't collect personal data. It's hosted on Cloudflare, which keeps standard request logs, and uses Cloudflare Web Analytics for cookieless, aggregate visit statistics. Each app listed here has its own privacy policy, linked from its page. Questions:",
  footerPrivacy: "Privacy",
  notFoundTitle: `Page not found — ${developer.name}`,
  notFoundHeading: "Page not found",
  notFoundHome: "Go to the home page",
};

const strings = { en } as const;

export type Locale = keyof typeof strings;
export const defaultLocale: Locale = "en";

export function useStrings(locale: string | undefined) {
  return strings[(locale ?? defaultLocale) as Locale] ?? strings[defaultLocale];
}
