import { render, type CollectionEntry } from "astro:content";
import { dirname, resolve, relative, isAbsolute } from "node:path";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";

// SSG bundles this module into a temporary directory; resolve source assets
// from the site's working directory rather than the compiled module location.
const root = process.cwd();
const publicRoot = resolve(root, "public");
const postsRoot = resolve(root, "src/content/posts");
function inside(base: string, path: string) {
  const part = relative(base, path);
  return part !== ".." && !part.startsWith("../") && !isAbsolute(part);
}

/** Use the first real Markdown image, leaving its original in the article. */
export async function getPostPreview(post: CollectionEntry<"posts">) {
  const { remarkPluginFrontmatter } = await render(post);
  const first = remarkPluginFrontmatter.firstContentImage as { src: string; alt: string } | undefined;
  if (!first?.src) return undefined;
  const original = { ...first, srcSet: undefined as string | undefined };
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(first.src)) return original;
  let pathname: string;
  try { pathname = decodeURIComponent(first.src.split(/[?#]/)[0]); }
  catch { return original; }
  const path = pathname.startsWith("/")
    ? resolve(publicRoot, "." + pathname)
    : resolve(dirname(resolve(root, post.filePath ?? "src/content/posts/unknown.md")), pathname);
  if ((!inside(publicRoot, path) && !inside(postsRoot, path)) || !existsSync(path)) return original;
  const bytes = readFileSync(path);
  const metadata = await sharp(bytes).metadata().catch(() => undefined);
  if (!metadata?.width || !metadata.height || !metadata.format) return original;
  const hash = createHash("sha256").update(bytes).update("preview-webp-v1-78").digest("hex").slice(0, 16);
  const directory = resolve(publicRoot, "post-previews");
  mkdirSync(directory, { recursive: true });
  const widths = [...new Set([240, 480, 640].map(width => Math.min(width, metadata.width!)))];
  const candidates = await Promise.all(widths.map(async width => {
    const name = `${hash}-${width}.webp`;
    const output = resolve(directory, name);
    if (!existsSync(output)) {
      await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(output);
    }
    return { src: `/post-previews/${name}`, width };
  }));
  return { ...first, src: candidates.at(-1)!.src, srcSet: candidates.map(image => `${image.src} ${image.width}w`).join(", ") };
}
