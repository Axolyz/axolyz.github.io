import { defineConfig } from "astro/config";
import shirones from "shirones";
import { obsidianMarkdown } from "./src/publishing/obsidian-markdown.mjs";

// Site-level settings (site URL, base, title, theme colour, fonts, …) live in
// `shirones/config/` so they stay typed and version-controlled with your
// content. This file only wires the theme in.
export default defineConfig({
  integrations: [
    shirones({
      // Render moments with the same Obsidian compatibility as articles.
      excludeRoutes: ["/moments"],
      // Override individual components by mirroring the theme's structure in
      // `src/components/`, or point at them explicitly:
      // components: { "atoms/blog/PostCard": "./src/components/PostCard.astro" },
    }),
    obsidianMarkdown(),
  ],
});
