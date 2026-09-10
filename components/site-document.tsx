import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Arrow } from "@/components/icons";
import { profile } from "@/data";
import { absoluteUrl,assetPath,hasPublicOrigin,jsonLd,siteOrigin,languageAlternates } from "@/lib/site";
import { labels,localePath,type Locale } from "@/lib/localization";
import { assertValidContent } from "@/lib/content-validation";
import "@/app/globals.css";
assertValidContent();
export function siteMetadata(locale:Locale):Metadata {
 const l=labels(locale);const description=locale==="zh"?profile.description:(profile.biography?.en||`${l.role}. LLM, multimodal systems, agents, and evaluation.`);
 return {metadataBase:new URL(siteOrigin),title:{default:`${profile.name} — ${l.researchEngineering}`,template:`%s | ${profile.name}`},description,applicationName:`${profile.name} · ${l.researchEngineering}`,authors:[{name:profile.name}],robots:{index:hasPublicOrigin,follow:true},alternates:{canonical:absoluteUrl(localePath("/",locale)),languages:languageAlternates("/")},icons:{icon:assetPath("/icon.svg")},openGraph:{type:"website",locale:locale==="zh"?"zh_CN":"en_US",siteName:profile.name,title:`${profile.name} — ${l.researchEngineering}`,description,url:absoluteUrl(localePath("/",locale)),images:[{url:absoluteUrl("/og.png"),width:1200,height:630,alt:`${profile.name} — LLM · Multimodal · Agent · Evaluation`}]},twitter:{card:"summary_large_image",title:`${profile.name} — ${l.researchEngineering}`,description,images:[absoluteUrl("/og.png")]}};
}
export function SiteDocument({children,locale}:{children:ReactNode;locale:Locale}) {
 const l=labels(locale);const person={"@context":"https://schema.org","@type":"Person",name:profile.name,jobTitle:l.role,description:locale==="zh"?profile.description:profile.biography?.en,...(hasPublicOrigin?{url:absoluteUrl(localePath("/",locale))}:{}),knowsAbout:profile.topics,sameAs:[profile.github,profile.scholar].filter(Boolean),...(profile.email?{email:profile.email}:{})};
 return <html lang={locale==="zh"?"zh-CN":"en"}><body><a className="skip-link" href="#main">{l.skip}</a><Navigation locale={locale}/><main id="main" className="site-main" tabIndex={-1}>{children}</main><footer className="site-footer"><div className="footer-top"><Link className="footer-name" href={localePath("/",locale)}>{profile.name}</Link><p>{l.researchTopics}</p><a className="back-top" href="#main">{l.backTop}<Arrow diagonal/></a></div><div className="footer-bottom"><span>© {new Date().getUTCFullYear()} {profile.name}</span><span>{l.footer}</span></div></footer><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(person)}}/></body></html>;
}
