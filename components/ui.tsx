import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow } from "@/components/icons";
import { assetPath } from "@/lib/site";
import { contentHref, labels, type Locale } from "@/lib/localization";

export function TextLink({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="text-link">{children}<Arrow /></Link>; }
export function ResourceLinks({ links, locale = "zh" }: { links: object; locale?: Locale }) {
  const l = labels(locale);
  const names: Record<string, string> = { paper:l.paper, code:l.code, dataset:l.dataset, demo:l.demo, project:l.project, pullRequest:l.pullRequest, repository:l.repository, docs:l.docs };
  return <div className="resource-links">{Object.entries(links).filter(([, value]) => value).map(([key, href]: [string, string]) => <a key={key} href={assetPath(contentHref(href, locale))} className="resource-link">{names[key] || key}<Arrow diagonal /></a>)}</div>;
}
export function EmptyState({ title, description, compact = false, locale = "zh" }: { title: string; description: string; compact?: boolean; locale?: Locale }) { return <div className={compact ? "empty-state compact" : "empty-state"}><span className="empty-indicator" aria-hidden="true" /><div><h3>{title}</h3><p data-reading-highlight="">{description}</p></div><span className="small-label empty-label">{labels(locale).toAdd}</span></div>; }
export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description" data-reading-highlight="">{description}</p></header>; }
export function SectionHeading({ number, title, href, linkText }: { number: string; title: string; href?: string; linkText?: string }) { return <div className="section-heading"><div className="section-title"><span className="section-number">{number}</span><h2>{title}</h2></div>{href && <TextLink href={href}>{linkText ?? labels().viewAll}</TextLink>}</div>; }
