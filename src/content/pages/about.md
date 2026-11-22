---
title: "About"
description: "What the AstroSage theme does, and how to use it for your own Astro blog."
---

AstroSage is a readability-first blog theme for [Astro](https://astro.build/), made for long technical posts. It started as a fork of [AstroPaper](https://github.com/satnaing/astro-paper) by Sat Naing and was rebuilt around serif typography, a warm paper palette and a table of contents that stays beside the text. This site is its live demo: every element is on one page in [the showcase post](https://astro-sage.chintak.sh/posts/showcase/).

## What you get

### Reading

- A serif body (Newsreader, Source Serif 4 or Literata) at 18.5px on a column held to 66–71 characters, with JetBrains Mono for labels, dates and code.
- Warm paper in light mode and espresso in dark, with every colour checked for contrast.
- A table of contents pinned beside the text that highlights where you are, and folds into an "On this page" block on phones.

### Writing

- Math with KaTeX, code with Expressive Code (titles, diffs, line numbers, a language label and a copy button), and Mermaid or Excalidraw diagrams, all rendered when the site builds.
- Callouts, footnotes, tables, round task lists, and images that break out to `wide` or `full` width.
- Wiki-links between posts (`[[slug]]`, `[[slug#Heading]]`), and series with "Part N of M" navigation.

### Sharing and discovery

- A share sheet for X, LinkedIn, Bluesky, Reddit, Hacker News and email; selected text can be shared as a link to that passage or as an image card.
- A social preview image drawn for every post, a full-text RSS feed, a sitemap, search, tags with post counts, and a "Cite this post" block with BibTeX.
- Optional comments through [utterances](https://utteranc.es) or [giscus](https://giscus.app), backed by GitHub.

### Runs anywhere

- The build is a folder of static files: host it on Netlify, Vercel, GitHub Pages, Cloudflare or your own server. There's no server or database to run, and an article page ships only a few kilobytes of JavaScript.

## Use it for your blog

You'll need Node 22.12 or later. The template uses [pnpm](https://pnpm.io); the npm package works with any package manager.

### Start a new blog

```bash
pnpm create astro@latest my-blog --template chintak/astro-sage
cd my-blog
pnpm dev
```

This gives you the theme and a ready-made site (`apps/demo`), the same code as this demo. Then:

1. Set your details in `apps/demo/sage.config.ts`: site URL, title, author and social links.
2. Replace the posts in `apps/demo/src/content/posts/` and edit this page, `src/content/pages/about.md`.
3. Run `pnpm build` and upload `apps/demo/dist/` to any static host.

### Add it to an existing Astro site

Install the theme from npm:

```bash
pnpm add astro-sage
```

Then register it. It adds every page itself, so you can delete your `src/pages/`:

```ts title="astro.config.ts"
import { defineConfig } from "astro/config";
import astroSage from "astro-sage";
import sageConfig from "./sage.config";

export default defineConfig({
  site: sageConfig.site.url,
  integrations: [astroSage(sageConfig)],
});
```

```ts title="src/content.config.ts"
import { defineSageCollections } from "astro-sage/content";
import config from "../sage.config";

export const collections = defineSageCollections({
  author: config.site.author,
});
```

### Configure it

Everything lives in one file. Only `site` is required:

```ts title="sage.config.ts"
import { defineSageConfig } from "astro-sage";

export default defineSageConfig({
  site: {
    url: "https://example.com/",
    title: "My notes",
    description: "Things I learned.",
    author: "Ada Lovelace",
  },
  typography: { serif: "newsreader" },
  socials: [{ name: "github", url: "https://github.com/ada" }],
  comments: { provider: "utterances", repo: "ada/notes" },
});
```

Every option, with its default, is listed in [FEATURES.md](https://github.com/chintak/astro-sage/blob/main/FEATURES.md#configuration-sageconfigts).

### Write a post

Add a Markdown or MDX file to `src/content/posts/`:

```md title="src/content/posts/hello.md"
---
title: "Hello, world"
description: "A one-line summary for lists, RSS and previews."
pubDatetime: 2026-10-16T09:00:00Z
tags: ["notes"]
---

Inline math like $e^{i\pi} + 1 = 0$,
a [[colophon|link to another post]], and a callout:

> [!TIP]
> Set `draft: true` to keep a post out of the build. `astro dev` still shows it, marked "Draft".
```

The [showcase post](https://astro-sage.chintak.sh/posts/showcase/) shows the syntax for everything else, and [its source](https://github.com/chintak/astro-sage/blob/main/apps/demo/src/content/posts/showcase/index.mdx) is a good template.

## Staying up to date

AstroSage follows semantic versioning and is published to npm as [`astro-sage`](https://www.npmjs.com/package/astro-sage). Each release is listed on [GitHub](https://github.com/chintak/astro-sage/releases), with notes in the [changelog](https://github.com/chintak/astro-sage/blob/main/packages/astro-sage/CHANGELOG.md). To upgrade, run `pnpm update astro-sage`.

Questions and bug reports are welcome as [GitHub issues](https://github.com/chintak/astro-sage/issues). AstroSage is MIT-licensed.
