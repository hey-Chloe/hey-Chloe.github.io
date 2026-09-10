import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/icons";
import { localizedContent } from "@/components/localized-content";
import { ResourceLinks } from "@/components/ui";
import { labels, localePath, type Locale } from "@/lib/localization";
import { assetPath } from "@/lib/site";

export function ResearchList({ locale = "zh" }: { locale?: Locale }) {
  const { research, siteCopy } = localizedContent(locale);
  const l = labels(locale);

  if (!research.length) {
    return <div className="research-empty"><div className="research-empty-copy"><span className="small-label"><span className="status-dot" />{l.archive}</span><h3>{siteCopy.research.emptyTitle}</h3><p data-reading-highlight="">{siteCopy.research.emptyDescription}</p><p className="availability-note">{l.forthcoming}</p></div></div>;
  }

  return <div className="research-list">{research.map((item, index) => (
    <article className="research-card" key={item.slug}>
      <Link href={localePath(`/research/${item.slug}/`, locale)} className="research-thumbnail" aria-label={item.title}>
        <Image
          src={assetPath(item.thumbnail.src)}
          alt={item.thumbnail.alt}
          width={item.thumbnail.width}
          height={item.thumbnail.height}
          sizes="(max-width: 700px) 100vw, 260px"
          preload={index === 0}
          fetchPriority={index === 0 ? "high" : undefined}
        />
      </Link>
      <div className="research-card-copy">
        <h3><Link href={localePath(`/research/${item.slug}/`, locale)}><span>{item.title}</span><Arrow diagonal /></Link></h3>
        <span className="small-label research-meta">{String(index + 1).padStart(2, "0")} / {item.venue} <span className="badge">{item.status}</span></span>
        <dl>
          <div><dt>{l.researchQuestion}</dt><dd>{item.question}</dd></div>
          <div><dt>{l.method}</dt><dd>{item.method}</dd></div>
          <div><dt>{l.keyResults}</dt><dd><ul>{item.keyResults.map(result => <li key={result}>{result}</li>)}</ul></dd></div>
        </dl>
        <ResourceLinks locale={locale} links={{ ...item.links, project: `/research/${item.slug}/` }} />
      </div>
    </article>
  ))}</div>;
}
