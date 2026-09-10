import type { Metadata } from "next";
import { profile } from "@/data";
import { localePath, type Locale } from "@/lib/localization";

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";
const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
export const hasPublicOrigin = Boolean(configuredOrigin);
export const siteOrigin = configuredOrigin || "http://localhost:3000";
const parsedOrigin = new URL(siteOrigin);
if (!/^https?:$/.test(parsedOrigin.protocol) || parsedOrigin.pathname !== "/" || parsedOrigin.search || parsedOrigin.hash || parsedOrigin.username || parsedOrigin.password) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin, without path, credentials, query or hash. Use NEXT_PUBLIC_BASE_PATH for a repository path.");
}
export function assetPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
export function absoluteUrl(path: string): string {
  return new URL(assetPath(path), siteOrigin).toString();
}
export function languageAlternates(path: string) { return { "zh-CN": absoluteUrl(localePath(path,"zh")), en: absoluteUrl(localePath(path,"en")), "x-default": absoluteUrl(localePath(path,"zh")) }; }
export function pageMetadata(title: string, description: string, path: string, locale: Locale = "zh"): Metadata {
  const localizedPath = localePath(path,locale);
  return {
    title, description,
    alternates: { canonical: absoluteUrl(localizedPath), languages: languageAlternates(path) },
    openGraph: { title: `${title} · ${profile.name}`, description, url: absoluteUrl(localizedPath), locale: locale === "zh" ? "zh_CN" : "en_US", type: "website", images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 630, alt: `${profile.name} — ${profile.role}` }] },
    twitter: { card: "summary_large_image", title: `${title} · ${profile.name}`, description, images: [absoluteUrl("/og.png")] },
  };
}
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
