type WordmarkTag = 'div' | 'h1' | 'p' | 'span';

type ChloesArchiveWordmarkProps = {
  as?: WordmarkTag;
  className?: string;
  id?: string;
  stacked?: boolean;
  prefix?: string;
  decorative?: boolean;
  ariaLabel?: string;
};

export default function ChloesArchiveWordmark({
  as: Tag = 'span',
  className = '',
  id,
  stacked = false,
  prefix,
  decorative = false,
  ariaLabel = 'Chloe’s Archive'
}: ChloesArchiveWordmarkProps) {
  const classes = [
    'chloes-archive-wordmark',
    stacked ? 'chloes-archive-wordmark--stacked' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Tag
      id={id}
      className={classes}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative || undefined}
      lang="en"
    >
      {prefix ? <span className="chloes-archive-wordmark__prefix">{prefix}</span> : null}
      <span className="chloes-archive-wordmark__chloe">Chloe’s</span>
      <span className="chloes-archive-wordmark__archive">Archive</span>
    </Tag>
  );
}
