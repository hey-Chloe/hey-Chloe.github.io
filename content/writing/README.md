# Research notes

This directory intentionally contains no published notes. No personal research,
results, or authorship has been invented.

1. Copy `content/templates/note.mdx` to `content/writing/your-note-slug.mdx`.
2. Replace all TODO text with verified material and add your actual publication date.
3. Keep `draft: true` while editing. Drafts do not appear in listings, the sitemap,
   or static pages. Missing `draft` also defaults to unpublished.
4. Set `draft: false` when the note is ready, then run `npm run build` and the link checks.

Published frontmatter requires a non-empty `title`, `description`, a valid
quoted `date` in `"YYYY-MM-DD"` format, and `tags` as a string array (an empty array is
allowed). Filenames must contain lowercase letters, digits, and single hyphens.
Invalid published content fails the build with the filename and field.
Unquoted YAML dates are rejected because YAML can silently normalize invalid days.

Supported authoring features:

- Markdown, GFM tables and task lists.
- Inline math `$...$` and display math `$$...$$`, rendered with KaTeX.
- Fenced code with a language, rendered with syntax highlighting.
- `<Figure src="/images/your-figure.svg" alt="Description" width={1200} height={720} caption="Caption" />`.
  Put local assets in `public/`; use paths beginning with `/`. The component adds
  the configured GitHub Pages base path automatically.
- `<Cite id="source" />`, followed by a matching
  `<References><Reference id="source">…</Reference></References>` section.
  Cite the original source with a real link. Reference IDs must be unique per note;
  every citation must have a matching reference. IDs must be literal strings made
  of letters, digits, hyphens, or underscores. These constraints are checked at build time.

MDX is executable content. Only compile files written or reviewed by the site
owner. Do not evaluate visitor submissions, fetched remote MDX, or other
untrusted content. Components are already available without imports.

The `_unpublished` build parameter exists only to keep Next.js static export
compatible with an empty content directory. It renders the not-found page and
must never be added to navigation or the sitemap.
