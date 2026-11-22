import { dirname, resolve, relative } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { searchUI } from "./search-ui";
import { cjkEmphasisFaces } from "./cjk-emphasis";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const themeRoot = dirname(fileURLToPath(import.meta.resolve("astro-sage")));
const fontBundle = resolve(projectRoot, "src/assets/fonts/custom/fonts.css");

// Fail explicitly after upstream changes instead of silently losing site features.
const anchors: Record<string, string[]> = {
  "components/Card.astro": ['variant?: "h2" | "h3";', 'const locale = Astro.currentLocale ?? config.site.lang;', '<li class="post-card">', '</li>'],
  "components/Header.astro": ['{ path: "/posts", label: t.nav.posts },', '<header class="app-layout">'],
  "routes/posts/[...slug]/index.astro": ['const { Content, headings } = await render(post);', 'let ogImageUrl: string | undefined;', '<Header />'],
  "routes/search.astro": ['showImages: false,'],
  "routes/archives/index.astro": ['new Intl.DateTimeFormat(locale,', '<Card {...data} />'],
  "routes/404.astro": ['<main', '</main>'],
  "components/Main.astro": ['const { pageTitle, pageDesc, class: className } = Astro.props;'],
  "layouts/Layout.astro": ['Astro.currentLocale ?? site.lang', '<Font cssVariable="--font-mono" preload />', 'const theme = stored ?? (prefersDark ? "dark" : "light");'],
  "routes/about.astro": ['const about = await getEntry("pages", "about");'],
};
function readSource(id: string) {
  const source = readFileSync(id, "utf8");
  const name = relative(themeRoot, id).replaceAll("\\", "/");
  for (const anchor of anchors[name] ?? []) {
    if (!source.includes(anchor)) throw new Error(`AstroSage ${name} changed; review the site adaptation: ${anchor}`);
  }
  return source;
}

/** Adapt npm sources before Astro compilation; never copy or edit the theme. */
export function adaptThemeSource(id: string) {
  if (id === resolve(themeRoot, "components/Datetime.astro")) {
    const source = readSource(id);
    if (!source.includes("<IconCalendar") || !source.includes("new Intl.DateTimeFormat(config.site.lang,")) {
      throw new Error("AstroSage Datetime changed; review the icon-only adaptation.");
    }
    return source
      .replace('import IconCalendar from "@sage/assets/icons/IconCalendar.svg";\n', "")
      .replace(/  <IconCalendar\b[\s\S]*?\/>\n/, "")
      .replace('new Intl.DateTimeFormat(config.site.lang,', 'new Intl.DateTimeFormat("en-US",');
  }
  if (id === resolve(themeRoot, "styles/global.css")) {
    const hasCustomFonts = existsSync(fontBundle);
    const fontImport = hasCustomFonts ? `@import "@fontsource-variable/noto-serif-sc/wght.css";\n@import ${JSON.stringify(fontBundle)};\n` : "";
    // Inline the mapped faces here: CSS @imports are resolved by
    // PostCSS and don't necessarily pass through Vite's load hook.
    return `${fontImport}@import ${JSON.stringify(resolve(projectRoot, "src/styles/cjk-emphasis.css"))};\n@import ${JSON.stringify(resolve(projectRoot, "src/styles/typography.css"))};\n@import ${JSON.stringify(resolve(projectRoot, "src/styles/overrides.css"))};\n@import ${JSON.stringify(resolve(projectRoot, "src/styles/covers.css"))};\n${readSource(id)}\n${cjkEmphasisFaces(hasCustomFonts)}`;
  }
  if (id === resolve(themeRoot, "routes/index.astro")) {
    const source = readSource(id);
    if (!source.includes('<section class="hero">')) throw new Error("AstroSage home hero changed; review the cover integration.");
    return source
      .replace("---\n", `---\nimport CoverHero from ${JSON.stringify(resolve(projectRoot, "src/components/CoverHero.astro"))};\nimport { homeCover } from ${JSON.stringify(resolve(projectRoot, "src/theme/visuals.ts"))};\n`)
      .replace(/<section class="hero">([\s\S]*?)<\/section>/, '<CoverHero {...homeCover} variant="home">$1</CoverHero>');
  }
  if (id === resolve(themeRoot, "components/Card.astro")) {
    return readSource(id)
      .replace("---\n", `---\nimport { getPostPreview } from ${JSON.stringify(resolve(projectRoot, "src/lib/post-preview.ts"))};\n`)
      .replace('variant?: "h2" | "h3";', 'variant?: "h2" | "h3";\n  showPreview?: boolean;')
      .replace('const locale = Astro.currentLocale ?? config.site.lang;', 'const locale = Astro.currentLocale ?? config.site.lang;\nconst preview = Astro.props.showPreview === false ? undefined : await getPostPreview(Astro.props);')
      .replace('<li class="post-card">', '<li class:list={["post-card", { "has-preview": !!preview }]}><div class="card-copy" style={!preview ? "display: contents" : undefined}>')
      .replace('</li>', `</div>{preview && <a class="post-thumbnail" href={getPostUrl(id, filePath, Astro.currentLocale)} tabindex="-1" aria-hidden="true">
        <img src={preview.src} srcset={preview.srcSet} sizes="(max-width: 640px) 360px, (max-width: 1024px) 32vw, 340px" alt="" loading="lazy" decoding="async" width="360" height="240" />
      </a>}</li>`);
  }
  if (id === resolve(themeRoot, "routes/posts/[...slug]/index.astro")) {
    const source = readSource(id);
    if (!source.includes('<Header />') || !source.includes('<header class="post-header">')) {
      throw new Error("AstroSage article changed; review the cover integration.");
    }
    return source
      .replace("---\n", `---\nimport CoverHero from ${JSON.stringify(resolve(projectRoot, "src/components/CoverHero.astro"))};\nimport { homeCover } from ${JSON.stringify(resolve(projectRoot, "src/theme/visuals.ts"))};\n`)
      .replace("const { Content, headings } = await render(post);", "const { Content, headings, remarkPluginFrontmatter } = await render(post);")
      .replace("let ogImageUrl: string | undefined;", "let ogImageUrl: string | undefined = remarkPluginFrontmatter.firstContentImage?.src ?? homeCover.src;")
      // The banner is a sibling. Article header, grid and TOC stay upstream.
      .replace('<Header />', '<Header />\n  <CoverHero {...homeCover} variant="post" />');
  }
  if (id === resolve(themeRoot, "components/Header.astro")) {
    return readSource(id)
      .replace('{ path: "/posts", label: t.nav.posts },', '{ path: "/posts", label: t.nav.posts },\n  { path: "/moments", label: "Moments" },')
      .replace('<header class="app-layout">', '<header class="app-layout" lang="en">');
  }
  if (id === resolve(themeRoot, "routes/search.astro")) {
    return readSource(id).replace("showImages: false,", `showImages: false, translations: ${JSON.stringify(searchUI)},`);
  }
  if (id === resolve(themeRoot, "routes/archives/index.astro")) {
    return readSource(id)
      .replace('new Intl.DateTimeFormat(locale,', 'new Intl.DateTimeFormat("en-GB",')
      .replace('<Card {...data} />', '<Card {...data} showPreview={false} />');
  }
  if (id === resolve(themeRoot, "routes/404.astro")) {
    return readSource(id)
      .replace("---\n", '---\nimport Main from "@sage/components/Main.astro";\n')
      .replace(/<main[\s\S]*?>([\s\S]*?)<\/main>/, (_, content: string) =>
        `<Main pageTitle="404" pageDesc={t.notFound.message}>${content
          .replace(/<h1[\s\S]*?<\/h1>/, "")
          .replace(/<p class="mt-4[\s\S]*?<\/p>/, "")}</Main>`);
  }
  if (id === resolve(themeRoot, "components/Main.astro")) {
    const source = readSource(id);
    const heading = source.match(/    <h1[\s\S]*?(?=    <slot \/>)/)?.[0];
    if (!heading || !source.includes('class="max-w-measure mx-auto pt-10 sm:pt-14"')) {
      throw new Error("AstroSage Main changed; review the page cover integration.");
    }
    return source
      .replace("---\n", `---\nimport CoverHero from ${JSON.stringify(resolve(projectRoot, "src/components/CoverHero.astro"))};\nimport { homeCover } from ${JSON.stringify(resolve(projectRoot, "src/theme/visuals.ts"))};\n`)
      .replace('const { pageTitle, pageDesc, class: className } = Astro.props;', 'const { pageTitle, pageDesc, class: className } = Astro.props;\nconst isPostsPage = Astro.url.pathname.split("/").filter(Boolean)[0] === "posts";')
      .replace('  <div class="max-w-measure mx-auto pt-10 sm:pt-14">', `<CoverHero {...homeCover} variant="page">${heading.replace('text-muted-foreground mt-3 mb-8 text-lg italic', 'intro')}</CoverHero>\n  <div class:list={["page-content mx-auto", isPostsPage ? "posts-content" : "max-w-measure"]}>`)
      .replace(heading, "");
  }
  if (id === resolve(themeRoot, "layouts/Layout.astro")) {
    return readSource(id)
      .replaceAll("Astro.currentLocale ?? site.lang", "Astro.locals.contentLanguage ?? Astro.currentLocale ?? site.lang")
      // Legacy Shirone visitors may have stored "auto". Resolve it to the OS
      // preference before the native theme script and first paint.
      .replace('const theme = stored ?? (prefersDark ? "dark" : "light");', 'const theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");')
      .replace('<Font cssVariable="--font-mono" preload />', "");
  }
  if (id === resolve(themeRoot, "routes/about.astro")) {
    return readSource(id).replace('const about = await getEntry("pages", "about");', 'Astro.locals.contentLanguage = "en";\nconst about = await getEntry("pages", "about");');
  }
  return null;
}
