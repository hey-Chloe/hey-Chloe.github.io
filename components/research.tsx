import Link from "next/link";
import Image from "next/image";
import { localizedContent } from "@/components/localized-content";
import { ResourceLinks } from "@/components/ui";
import { assetPath } from "@/lib/site";
import { labels, localePath, type Locale } from "@/lib/localization";
export function ResearchList({ locale = "zh" }: { locale?: Locale }) {
  const { research, siteCopy } = localizedContent(locale); const l=labels(locale);
  if (!research.length) return <div className="research-empty"><div className="research-empty-copy"><span className="small-label"><span className="status-dot" />{l.archive}</span><h3>{siteCopy.research.emptyTitle}</h3><p data-reading-highlight="">{siteCopy.research.emptyDescription}</p><p className="availability-note">{l.forthcoming}</p></div></div>;
  return <div className="research-list academic-research-list">{research.map(item => (
    <article className="research-card" key={item.slug}>
      <Link href={localePath(`/research/${item.slug}/`, locale)} className="research-thumbnail" aria-label={item.title}>
        <Image src={assetPath(item.thumbnail.src)} alt={item.thumbnail.alt} width={item.thumbnail.width} height={item.thumbnail.height} sizes="(max-width: 700px) calc(100vw - 44px), 230px" />
      </Link>
      <div className="research-card-copy">
        <h3><Link href={localePath(`/research/${item.slug}/`, locale)}>{item.title}</Link></h3>
        <p className="research-stage">{item.venue}<span> · </span>{item.status}</p>
        <p className="research-summary">{item.question}</p>
        <ul className="research-results" aria-label={l.keyResults}>{item.keyResults.map(result => <li key={result}>{result}</li>)}</ul>
        <ResourceLinks locale={locale} links={{ ...item.links, project: `/research/${item.slug}/` }} />
      </div>
    </article>
  ))}</div>;
}
