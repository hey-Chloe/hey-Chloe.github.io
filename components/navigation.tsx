"use client";
import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Arrow } from "@/components/icons";
import { profile } from "@/data/profile";
import { assetPath } from "@/lib/site";
import { labels, localePath, type Locale } from "@/lib/localization";

export function Navigation({ locale = "zh" }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const l = labels(locale);
  const items = [{ href: "/research/", label: l.research }, { href: "/publications/", label: l.publications }, { href: "/experience/", label: l.experience }, { href: "/projects/", label: l.projects }, { href: "/writing/", label: l.writing }];
  const preserveLocation = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = new URL(event.currentTarget.href);
    target.search = window.location.search; target.hash = window.location.hash;
    event.currentTarget.href = target.toString();
  };
  const switchPath = pathname.includes("_not-found") || pathname.includes("_global-not-found") ? "/" : pathname;
  return <header className="site-header"><div className="header-inner">
    <Link className="wordmark" href={localePath("/", locale)} aria-label={`${profile.name} · ${l.home}`} onClick={() => setOpen(false)}>{profile.name}</Link>
    <nav id="primary-navigation" aria-label={l.navigation} className={open ? "primary-nav is-open" : "primary-nav"} onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); } }}>
      {items.map(({ href, label }) => { const target = localePath(href, locale); return <Link key={href} href={target} aria-current={pathname === target || pathname === target.slice(0, -1) || pathname.startsWith(target) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>; })}
      <Link href={localePath("/cv/", locale)} className="nav-cv" onClick={() => setOpen(false)}>{l.cv} <Arrow diagonal /></Link>
    </nav>
    <div className="header-actions"><nav className="language-switch" aria-label={locale === "zh" ? "语言" : "Language"}>
      <a href={assetPath(localePath(switchPath, "zh"))} onClick={preserveLocation} lang="zh-CN" hrefLang="zh-CN" aria-current={locale === "zh" ? "true" : undefined}>中文</a><span aria-hidden="true">/</span><a href={assetPath(localePath(switchPath, "en"))} onClick={preserveLocation} lang="en" hrefLang="en" aria-current={locale === "en" ? "true" : undefined}>EN</a>
    </nav><button type="button" className="menu-toggle" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? l.close : l.menu}<span aria-hidden="true">{open ? "−" : "+"}</span></button></div>
  </div></header>;
}
