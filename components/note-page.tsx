import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote } from "@/lib/writing";
import { absoluteUrl,jsonLd,pageMetadata } from "@/lib/site";
import { labels,localePath,type Locale } from "@/lib/localization";
import { profile } from "@/data";
import "katex/dist/katex.min.css";
export async function noteMetadata(slug:string,locale:Locale) {const note=await getNote(slug,locale);if(!note)return {title:labels(locale).noteMissing,robots:{index:false,follow:false}};const metadata=pageMetadata(note.title,note.description,`/writing/${note.slug}/`,locale);return {...metadata,openGraph:{...metadata.openGraph,type:"article" as const,publishedTime:`${note.date}T00:00:00.000Z`,tags:note.tags}};}
export async function NoteContent({slug,locale}:{slug:string;locale:Locale}) {
 const note=await getNote(slug,locale);if(!note)notFound();const l=labels(locale);const url=absoluteUrl(localePath(`/writing/${note.slug}/`,locale));const displayDate=new Intl.DateTimeFormat(locale==="zh"?"zh-CN":"en-US",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}).format(new Date(`${note.date}T00:00:00.000Z`));
 return <article className="page-shell note-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({"@context":"https://schema.org","@type":"BlogPosting",headline:note.title,description:note.description,datePublished:note.date,url,mainEntityOfPage:url,image:absoluteUrl("/og.png"),author:{"@type":"Person",name:profile.name,url:absoluteUrl(localePath("/",locale))},keywords:note.tags})}}/><header className="page-intro"><Link href={localePath("/writing/",locale)} className="text-link">← {l.allWriting}</Link><p className="eyebrow">{l.writing}</p><h1>{note.title}</h1><p className="muted">{note.description}</p><p className="note-meta muted"><time dateTime={note.date}>{displayDate}</time><span aria-hidden="true"> · </span>{note.readingTime} {l.minRead}</p>{note.tags.length>0&&<ul className="note-tags" aria-label={l.topics}>{note.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}</header><div className="prose">{note.content}</div></article>;
}
