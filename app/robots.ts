import type { MetadataRoute } from "next";
import { absoluteUrl, hasPublicOrigin } from "@/lib/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", ...(hasPublicOrigin ? { allow: "/" } : { disallow: "/" }) }, ...(hasPublicOrigin ? { sitemap: absoluteUrl("/sitemap.xml") } : {}) }; }
