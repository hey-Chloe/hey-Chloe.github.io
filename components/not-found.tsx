import { TextLink } from "@/components/ui";
import { labels,localePath,type Locale } from "@/lib/localization";
export function NotFoundContent({locale="zh"}:{locale?:Locale}) {const l=labels(locale);return <div className="page-shell not-found"><p className="eyebrow">404</p><h1>{l.notFound}</h1><p className="page-description">{l.notFoundDescription}</p><TextLink href={localePath("/",locale)}>{l.returnHome}</TextLink></div>;}
