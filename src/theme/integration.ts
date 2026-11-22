import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { cpSync, existsSync, readFileSync } from "node:fs";
import astroSage, { type SageConfig } from "astro-sage";
import { satteri } from "@astrojs/markdown-satteri";
import { obsidianPlugin } from "../publishing/obsidian-markdown.mjs";
import { adaptThemeSource } from "./source-adaptations";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

/** Keep routing, Markdown, fonts, feeds, search, and SEO in the npm theme. */
export function siteTheme(config: SageConfig) {
  const theme = astroSage(config);
  const complete = theme.hooks["astro:build:done"];
  theme.hooks["astro:build:done"] = async (options) => {
    await complete?.(options);
    // Thumbnails can be created during SSG, after Astro's initial public copy.
    const previews = resolve(projectRoot, "public/post-previews");
    if (existsSync(previews)) cpSync(previews, new URL("post-previews/", options.dir), { recursive: true });
  };
  const setup = theme.hooks["astro:config:setup"]!;
  theme.hooks["astro:config:setup"] = async (options) => {
    let configured = options.config;
    await setup({
      ...options,
      updateConfig: (config) => {
        configured = options.updateConfig(config);
        return configured;
      },
    });
    const processor = configured.markdown.processor;
    const markdownOptions = processor.options as NonNullable<Parameters<typeof satteri>[0]>;
    // Astro hashes plugin names, so include our source to invalidate cached Markdown.
    const fingerprint = createHash("sha256").update(readFileSync(resolve(projectRoot, "src/publishing/obsidian-markdown.mjs"))).digest("hex").slice(0, 12);
    const publishingPlugin = { ...obsidianPlugin, name: obsidianPlugin.name + "-" + fingerprint };
    options.updateConfig({
      markdown: {
        processor: satteri({
          ...markdownOptions,
          mdastPlugins: [publishingPlugin, ...(markdownOptions.mdastPlugins ?? [])],
        }),
      },
      vite: {
        plugins: [{
          name: "axolyz-theme-details",
          enforce: "pre",
          load: adaptThemeSource,
        }],
      },
    });
  };
  return theme;
}
