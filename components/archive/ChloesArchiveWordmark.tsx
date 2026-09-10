import styles from './ChloesArchiveWordmark.module.css';

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
    styles.wordmark,
    stacked ? styles.stacked : '',
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
      {prefix ? <span className={styles.prefix}>{prefix}</span> : null}
      <span className={styles.chloe}>Chloe’s</span>
      <span className={styles.archive}>Archive</span>
    </Tag>
  );
}
