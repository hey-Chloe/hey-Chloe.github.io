# Chloe's Blog

A simple, static personal technical blog built with Next.js, TypeScript, Tailwind CSS, and Markdown.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build

```bash
npm run build
```

The static site will be generated in the `out` directory.

## Add a new post

Create a new Markdown file in `content/posts`, for example:

```md
---
title: "My New Note"
date: "2026-07-08"
description: "A short summary of this note."
tags: ["Java", "Web"]
---

Write your post here.
```

The filename becomes the URL slug. For example, `my-new-note.md` becomes `/blog/my-new-note`.
