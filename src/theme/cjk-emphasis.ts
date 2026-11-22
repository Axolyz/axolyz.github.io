import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Map existing font subsets, not individual text nodes or modified font files. */
function fontFaces(module: string, italic = false) {
  const path = fileURLToPath(import.meta.resolve(module));
  return readFileSync(path, "utf8")
    .replace(/font-family: '[^']+';/g, 'font-family: "Blog Tsuku SC";')
    .replaceAll("font-style: normal;", italic ? "font-style: italic;" : "font-style: normal;")
    .replace(/url\((['"]?)([^'"\)]+)\1\)/g, (_, _quote: string, asset: string) =>
      `url(${JSON.stringify(resolve(dirname(path), asset))})`);
}

export function cjkEmphasisFaces(hasCustomFonts: boolean) {
  // An italic-only family could also match normal text. Supply the normal
  // Noto serif face when the licensed Tsukushi bundle is unavailable.
  const normal = hasCustomFonts ? "" : fontFaces("@fontsource-variable/noto-serif-sc/wght.css");
  return normal +
    fontFaces("lxgw-wenkai-webfont/lxgwwenkai-regular.css", true) +
    fontFaces("lxgw-wenkai-webfont/lxgwwenkai-bold.css", true);
}
