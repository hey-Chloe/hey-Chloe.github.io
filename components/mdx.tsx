import type { ComponentProps, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { assetPath } from "@/lib/site";
import { contentHref, type Locale } from "@/lib/localization";

function localAsset(source: string): string {
  const compact = source.trim().replace(/[\u0000-\u0020\u007f]/g, "");
  if (/^(?:javascript|vbscript|data):/i.test(compact)) {
    throw new Error("MDX links and images must use a local path or a safe URL protocol.");
  }
  return source.startsWith("/") && !source.startsWith("//") ? assetPath(source) : source;
}

function MdxLink({ href, children, locale="zh", ...props }: ComponentProps<"a"> & { locale?: Locale }) {
  const destination = href ? localAsset(contentHref(href,locale)) : undefined;
  return <a {...props} href={destination}>{children}</a>;
}

function MdxImage({ src, alt, ...props }: ComponentProps<"img">) {
  return (
    // Content images work in both static exports and deployments with a base path.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} src={typeof src === "string" ? localAsset(src) : src} alt={alt ?? ""} loading="lazy" decoding="async" />
  );
}

function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  width: number;
  height: number;
}) {
  return (
    <figure className="note-figure">
      <MdxImage src={src} alt={alt} width={width} height={height} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function Cite({ id, children, locale="zh" }: { id: string; children?: ReactNode; locale?:Locale }) {
  return <a href={`#ref-${id}`} className="note-citation" aria-label={`${locale==="zh"?"参考文献":"Reference"} ${id}`}>{children ?? `[${id}]`}</a>;
}

function References({ children, locale="zh" }: { children: ReactNode; locale?:Locale }) {
  return <section className="note-references" aria-label={locale==="zh"?"参考文献":"References"}><ol>{children}</ol></section>;
}

function Reference({ id, children }: { id: string; children: ReactNode }) {
  return <li id={`ref-${id}`}>{children}</li>;
}

export function getMdxComponents(locale:Locale="zh"):MDXComponents { return {
  a: (props) => <MdxLink {...props} locale={locale}/>,
  img: MdxImage,
  span: ({ children, className, ...props }: ComponentProps<"span">) => (
    <span {...props} className={className} {...(className?.split(/\s+/).includes("katex-display") ? { tabIndex: 0, role: "region", "aria-label": locale==="zh"?"可滚动公式":"Scrollable equation" } : {})}>{children}</span>
  ),
  table: ({ children, ...props }: ComponentProps<"table">) => (
    <div className="mdx-table-scroll" role="region" aria-label={locale==="zh"?"可滚动数据表":"Scrollable data table"} tabIndex={0}>
      <table {...props}>{children}</table>
    </div>
  ),
  pre: ({ children, ...props }: ComponentProps<"pre">) => (
    <pre {...props} className={`mdx-code-scroll ${props.className ?? ""}`} tabIndex={0} role="region" aria-label={locale==="zh"?"代码示例":"Code example"}>{children}</pre>
  ),
  Figure,
  Cite: (props) => <Cite {...props} locale={locale}/>,
  References: (props) => <References {...props} locale={locale}/>,
  Reference,
}; }
