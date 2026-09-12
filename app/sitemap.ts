import type { MetadataRoute } from "next";
import { research } from "@/data";
import { getNotes } from "@/lib/writing";
import { absoluteUrl,hasPublicOrigin,languageAlternates } from "@/lib/site";
import { localePath } from "@/lib/localization";
export const dynamic="force-static";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{if(!hasPublicOrigin)return [];const notes=await getNotes();const paths=["/","/research/","/experience/","/projects/","/writing/","/cv/",...research.map(item=>`/research/${item.slug}/`),...notes.map(item=>`/writing/${item.slug}/`)];return [...paths.flatMap(path=>(["zh","en"] as const).map(locale=>({url:absoluteUrl(localePath(path,locale)),alternates:{languages:languageAlternates(path)}}))), ...["/archive/","/archive/about/","/archive/garden/"].map(path=>({url:absoluteUrl(path)}))];}
