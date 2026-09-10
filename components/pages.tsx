import Link from "next/link";
import Image from "next/image";
import { profile } from "@/data";
import { localizedContent } from "@/components/localized-content";
import { Arrow,ContactIcon,type ContactIconName } from "@/components/icons";
import { PageIntro,SectionHeading,EmptyState } from "@/components/ui";
import { ResearchList } from "@/components/research";
import { PublicationList } from "@/components/publications";
import { ExperienceList } from "@/components/experience";
import { OpenSourceList,ProjectList } from "@/components/projects";
import { NotesList } from "@/components/notes";
import { labels,localePath,type Locale } from "@/lib/localization";
import { assetPath,pageMetadata } from "@/lib/site";
export type PageKind="home"|"research"|"publications"|"experience"|"projects"|"writing"|"cv";
export function indexMetadata(kind:PageKind,locale:Locale) {
 const l=labels(locale);const {siteCopy}=localizedContent(locale);
 const map={home:[profile.name,locale==="zh"?profile.description:profile.biography?.en||siteCopy.hero.introduction],research:[l.research,siteCopy.research.description],publications:[l.publications,siteCopy.publications.description],experience:[l.experience,siteCopy.experience.description],projects:[l.projects,l.projectsDescription],writing:[l.writing,siteCopy.writing.description],cv:[l.curriculum,siteCopy.cv.description]};
 const metadata=pageMetadata(map[kind][0],map[kind][1],kind==="home"?"/":`/${kind}/`,locale);
 return kind==="home"?{...metadata,title:{absolute:`${profile.name} · ${l.researchEngineering}`}}:metadata;
}
function Education({locale}:{locale:Locale}) {
 if(!profile.education)return null;const e=profile.education;const l=labels(locale);
 return <section className="page-section education-section"><h2>{l.education}</h2><h3>{locale==="zh"?e.institution:e.institutionEn}</h3><p className="page-description">{locale==="zh"?e.degree:e.degreeEn} · {l.expected} {e.expectedGraduation}</p></section>;
}
export function HomeContent({locale}:{locale:Locale}) {
 const l=labels(locale);const {siteCopy}=localizedContent(locale);const links: {label:string;href?:string;icon:ContactIconName}[]=[{label:"GitHub",icon:"github",href:profile.github},{label:l.scholar,icon:"scholar",href:profile.scholar},{label:l.email,icon:"email",href:profile.email?`mailto:${profile.email}`:undefined}];
 const sections=[{id:"research",title:l.selectedResearch,href:"/research/",link:l.allResearch,description:siteCopy.research.description,content:<ResearchList locale={locale}/>},{id:"experience",title:l.industry,href:"/experience/",link:l.experience,content:<ExperienceList locale={locale}/>},{id:"publications",title:l.publications,href:"/publications/",link:l.fullList,content:<PublicationList locale={locale}/>},{id:"open-source",title:l.openSource,href:"/projects/#open-source",link:l.allContributions,description:siteCopy.openSource.description,content:<OpenSourceList locale={locale}/>},{id:"engineering",title:l.engineering,href:"/projects/#engineering",link:l.allProjects,content:<ProjectList locale={locale}/>},{id:"writing",title:l.writing,href:"/writing/",link:l.allWriting,content:<NotesList locale={locale} limit={3}/>}];
 return <div className="home-shell"><header className="profile-header">
  {profile.portrait&&<div className="hero-portrait"><Image src={assetPath(profile.portrait.src)} alt={profile.portrait.alt} width={profile.portrait.width} height={profile.portrait.height} preload sizes="(max-width:700px) 130px, 200px"/></div>}
  <div className="profile-introduction"><p className="eyebrow">{l.researchEngineering}</p><h1 lang="zh-CN">{profile.name}</h1><p className="hero-role">{l.role}</p><p className="hero-topics">{l.researchTopics}</p><p className="hero-bio" data-reading-highlight="">{profile.biography?.[locale]||siteCopy.hero.introductionChinese}</p><div className="hero-links"><Link href={localePath("/cv/",locale)} className="profile-link"><ContactIcon name="cv"/>{l.cv}</Link>{links.map(({label,href,icon})=>href?<a href={href} key={label} className="profile-link"><ContactIcon name={icon}/>{label}</a>:<span key={label} className="profile-link unavailable" aria-label={`${label}: ${l.unavailable}`} title={l.unavailable}><ContactIcon name={icon}/>{label}</span>)}</div></div>
 </header>{sections.map((section,index)=><section key={section.id} id={section.id} className={`home-section${section.id==="engineering"?" engineering-section":""}${section.id==="writing"?" writing-section":""}`}><SectionHeading number={String(index+1).padStart(2,"0")} title={section.title} href={localePath(section.href,locale)} linkText={section.link}/>{section.description&&<p className="section-description" data-reading-highlight="">{section.description}</p>}{section.content}</section>)}</div>;
}
export function IndexContent({kind,locale}:{kind:PageKind;locale:Locale}) {
 const l=labels(locale);const {siteCopy,researchInterests}=localizedContent(locale);
 if(kind==="home")return <HomeContent locale={locale}/>;
 if(kind==="research")return <div className="page-shell"><PageIntro eyebrow={`01 / ${l.research}`} title={l.research} description={siteCopy.research.description}/><h2 className="sr-only">{l.selectedResearch}</h2><ResearchList locale={locale}/><section className="page-section"><h2>{l.interests}</h2><div className="interest-grid">{researchInterests.map(item=><div className="interest" key={item.id}><span className="interest-number">{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></div>)}</div></section></div>;
 if(kind==="publications")return <div className="page-shell"><PageIntro eyebrow={`02 / ${l.publications}`} title={l.publications} description={siteCopy.publications.description}/><h2 className="sr-only">{l.publicationArchive}</h2><PublicationList locale={locale}/></div>;
 if(kind==="experience")return <div className="page-shell"><PageIntro eyebrow={`03 / ${l.experience}`} title={l.industry} description={siteCopy.experience.description}/><h2 className="sr-only">{l.roles}</h2><ExperienceList locale={locale}/><Education locale={locale}/></div>;
 if(kind==="projects")return <div className="page-shell"><PageIntro eyebrow={`04 / ${l.projects}`} title={l.projectsTitle} description={l.projectsDescription}/><section id="open-source" className="page-section"><SectionHeading number="01" title={l.openSource}/><p className="section-description">{siteCopy.openSource.description}</p><OpenSourceList locale={locale}/></section><section id="engineering" className="page-section"><SectionHeading number="02" title={l.engineering}/><p className="section-description">{siteCopy.engineering.description}</p><ProjectList locale={locale}/></section></div>;
 if(kind==="writing")return <div className="page-shell"><PageIntro eyebrow={`05 / ${l.writing}`} title={l.writing} description={siteCopy.writing.description}/><h2 className="sr-only">{l.publishedNotes}</h2><NotesList locale={locale}/></div>;
 return <div className="page-shell cv-page"><PageIntro eyebrow={`06 / ${l.curriculum}`} title={l.curriculum} description={siteCopy.cv.description}/><div className="cv-identity"><h2>{profile.name}</h2><p>{l.role}</p><p className="muted">{l.researchTopics}</p></div>{profile.cv?<a className="button-primary" href={assetPath(profile.cv)} download>{l.downloadCV}<Arrow diagonal/></a>:<EmptyState locale={locale} title={siteCopy.cv.emptyTitle} description={siteCopy.cv.emptyDescription}/>}<Education locale={locale}/></div>;
}
