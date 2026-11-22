import { defineSageConfig } from "astro-sage";

export default defineSageConfig({
  site: {
    url: "https://axolyz.github.io/",
    title: "東雲暁月",
    description: "文章、随笔与日常记录。",
    author: "Axolyz",
    lang: "zh",
    timezone: "America/Chicago",
    ogImage: "og-default.webp",
  },
  typography: {
    serif: "newsreader",
    fallbacks: {
      // The Chinese-first CJK fallback chain is supplied by typography.css.
      serif: [],
    },
  },
  home: { title: "東雲暁月", intro: "这里用来发布我写的文章。" },
  features: {
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: false,
    search: "pagefind",
    editPost: { enabled: false },
  },
  posts: { perPage: 12, perIndex: 8, scheduledPostMargin: 0 },
  comments: { provider: false },
  citation: { enabled: false },
  socials: [{ name: "github", url: "https://github.com/Axolyz" }],
});
