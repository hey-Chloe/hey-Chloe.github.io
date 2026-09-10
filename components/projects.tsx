import { localizedContent } from "@/components/localized-content";
import { EmptyState,ResourceLinks } from "@/components/ui";
import { labels,type Locale } from "@/lib/localization";
export function OpenSourceList({locale="zh"}:{locale?:Locale}) {
 const {openSource,siteCopy}=localizedContent(locale);const l=labels(locale);const kinds={"pull-request":l.pullRequest,repository:l.repository,infrastructure:l.infrastructure};
 if(!openSource.length)return <EmptyState locale={locale} title={siteCopy.openSource.emptyTitle} description={siteCopy.openSource.emptyDescription} compact/>;
 return <div className="contribution-list">{openSource.map(item=><article key={item.id} className="contribution"><div className="contribution-meta"><span className="small-label">{kinds[item.kind]}</span><span className="badge">{item.status}</span></div><h3>{item.title}</h3><p className="repository-name">{item.repository}</p><p>{item.description}</p><dl><div><dt>{l.contribution}</dt><dd>{item.contribution}</dd></div><div><dt>{l.result}</dt><dd>{item.result}</dd></div></dl><ResourceLinks locale={locale} links={item.links}/></article>)}</div>;
}
export function ProjectList({locale="zh"}:{locale?:Locale}) {
 const {projects,siteCopy}=localizedContent(locale);const l=labels(locale);
 if(!projects.length)return <EmptyState locale={locale} title={siteCopy.engineering.emptyTitle} description={siteCopy.engineering.emptyDescription} compact/>;
 return <div className="project-list">{projects.map(item=><article key={item.slug} className="project-entry"><div className="contribution-meta"><span className="small-label">{item.year}</span><span className="project-tags">{item.tags.join(" / ")}</span></div><h3>{item.title}</h3><p>{item.description}</p><dl><div><dt>{l.problem}</dt><dd>{item.problem}</dd></div><div><dt>{l.ownership}</dt><dd>{item.ownership}</dd></div><div><dt>{l.outcome}</dt><dd>{item.outcome}</dd></div></dl><ResourceLinks locale={locale} links={item.links}/></article>)}</div>;
}
