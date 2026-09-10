import { experience } from "@/data";
import { localizedContent } from "@/components/localized-content";
import { EmptyState } from "@/components/ui";
import { labels, type Locale } from "@/lib/localization";
function displayDate(value: string, locale: Locale) { return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { month:"short", year:"numeric", timeZone:"UTC" }).format(new Date(value.length === 7 ? `${value}-01T00:00:00Z` : `${value}T00:00:00Z`)); }
export function ExperienceList({ locale="zh" }: { locale?: Locale }) {
  const {siteCopy}=localizedContent(locale); const l=labels(locale);
  if (!experience.length) return <EmptyState locale={locale} title={siteCopy.experience.emptyTitle} description={siteCopy.experience.emptyDescription} />;
  return <div className="timeline">{[...experience].sort((a,b)=>b.startDate.localeCompare(a.startDate)).map(item=><article key={item.id} className="timeline-entry"><div className="timeline-date"><time dateTime={item.startDate}>{displayDate(item.startDate,locale)}</time><span>—</span>{item.endDate?<time dateTime={item.endDate}>{displayDate(item.endDate,locale)}</time>:<span>{l.present}</span>}</div><div className="timeline-body"><p className="small-label">{item.company}</p><h3>{item.role}</h3><p className="muted">{item.team}</p><dl>{[[l.problem,item.problem],[l.ownership,item.ownership],[l.method,item.method],[l.scale,item.scale],[l.result,item.result]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></article>)}</div>;
}
