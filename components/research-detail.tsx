import { notFound } from "next/navigation";
import Image from "next/image";
import { profile } from "@/data";
import type { ResearchSections } from "@/data";
import { localizedContent } from "@/components/localized-content";
import { absoluteUrl,assetPath,hasPublicOrigin,jsonLd,pageMetadata } from "@/lib/site";
import { labels,localePath,type Locale } from "@/lib/localization";
import { ResourceLinks,TextLink } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
const sectionKeys:(keyof ResearchSections)[]=["abstract","problem","method","architecture","dataset","experiments","results","ablation","failureAnalysis","demo","citation"];
export function researchMetadata(slug:string,locale:Locale) {const project=localizedContent(locale).research.find(item=>item.slug===slug);return project?pageMetadata(project.title,project.question,`/research/${slug}/`,locale):{title:labels(locale).researchMissing,robots:{index:false}};}
export function ResearchDetail({slug,locale}:{slug:string;locale:Locale}) {
 const project=localizedContent(locale).research.find(item=>item.slug===slug);if(!project)notFound();const l=labels(locale);
 return <article className="page-shell research-detail"><header className="page-intro"><TextLink href={localePath("/research/",locale)}>{l.allResearch}</TextLink><p className="eyebrow">{project.venue} / {project.status}</p><h1>{project.title}</h1><p className="page-description">{project.question}</p><ResourceLinks locale={locale} links={project.links}/></header><div className="detail-layout"><nav className="contents-nav" aria-label={l.onThisPage}><p className="small-label">{l.onThisPage}</p>{sectionKeys.map(key=><a href={`#${key}`} key={key}>{l[key]}</a>)}</nav><div className="prose">{sectionKeys.map(key=><section id={key} key={key}><h2>{l[key]}</h2>{key==="citation"?<div className="citation-block"><CopyButton locale={locale} text={project.sections.citation}/><pre tabIndex={0}>{project.sections.citation}</pre></div>:<><div className="preserve-lines">{project.sections[key]}</div>{key==="results"&&<figure className="research-result-figure"><div className="research-result-scroll" data-scrollable tabIndex={0} aria-label={l.resultFigure}><Image src={assetPath(project.thumbnail.src)} alt={project.thumbnail.alt} width={project.thumbnail.width} height={project.thumbnail.height} sizes="(max-width:700px) 640px, 740px"/></div><figcaption>{l.resultFigure}</figcaption></figure>}</>}</section>)}</div></div><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({"@context":"https://schema.org","@type":"CreativeWork",name:project.title,abstract:project.sections.abstract,inLanguage:locale==="zh"?"zh-CN":"en",creator:{"@type":"Person",name:profile.name},...(hasPublicOrigin?{url:absoluteUrl(localePath(`/research/${slug}/`,locale))}:{})})}}/></article>;
}
