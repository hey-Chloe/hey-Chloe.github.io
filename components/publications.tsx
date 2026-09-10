import { publications, publicationYears } from "@/data";
import { ResourceLinks } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { labels, type Locale } from "@/lib/localization";

export function PublicationList({ locale="zh" }: { locale?:Locale }) {
  const l=labels(locale);
  const years = [...new Set([...publicationYears, ...publications.map(item => item.year)])].sort((a, b) => b - a);
  return <div className="publication-list">{years.map(year => <section className="publication-year" key={year} aria-label={`${l.publications} ${year}`}><h3>{year}</h3><div className="year-entries">{publications.filter(item => item.year === year).length ? publications.filter(item => item.year === year).map(item => <article className="publication-entry" key={item.id}><span className="badge">{item.venue}</span><h4>{item.title}</h4><p className="authors">{item.authors.map((author, index) => <span key={`${author.name}-${index}`}>{index > 0 && ", "}{author.isSelf ? <strong>{author.name}</strong> : author.name}</span>)}</p><div className="publication-actions"><ResourceLinks locale={locale} links={item.links} /><details className="bibtex"><summary>BibTeX</summary><div className="bibtex-content"><CopyButton locale={locale} text={item.bibtex} /><pre tabIndex={0}>{item.bibtex}</pre></div></details></div></article>) : <p className="year-empty">{l.noPublications}<span aria-hidden="true">—</span></p>}</div></section>)}</div>;
}
