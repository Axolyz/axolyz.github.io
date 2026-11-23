import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import assert from "node:assert/strict";

const root = resolve("dist");
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
const built = files(root);
const pages = built.filter(path => path.endsWith(".html"));
const references = new Set();
for (const path of pages) {
  const html = readFileSync(path, "utf8");
  assert.match(html, /<link\b[^>]*rel="icon"[^>]*type="image\/png"[^>]*href="\/favicon-32\.png\?v=[a-f0-9]+"[^>]*sizes="32x32"/, `${path}: explicit, versioned PNG favicon`);
  assert.equal((html.match(/<section\b[^>]*class="cover-hero\b/g) ?? []).length, 1, `${relative(root, path)}: one site cover`);
  assert.match(html, /<link\b[^>]*rel="preload"[^>]*as="image"/, `${path}: preload the shared cover before painting`);
  assert.match(html, /<img\b[^>]*class="cover-hero__image"[^>]*decoding="sync"/, `${path}: do not paint the cover's backing before decoding`);
  if (html.includes("cover-hero--post")) {
    const coverEnd = html.indexOf("</section>", html.indexOf("cover-hero--post"));
    assert.ok(coverEnd < html.indexOf("<main"), `${path}: cover stays outside the native article layout`);
    assert.ok(html.includes('class="post-header"'), `${path}: native article header remains`);
  }
  for (const match of html.matchAll(/\b(?:src|href)="(\/[^"#?]*)/g)) references.add(match[1]);
}
// Includes fonts referenced by compiled styles, so CI cannot silently lose them.
for (const path of built.filter(path => path.endsWith(".css"))) {
  for (const match of readFileSync(path, "utf8").matchAll(/url\(["']?(\/[^)"']+)/g)) references.add(match[1].split(/[?#]/)[0]);
}
for (const reference of references) {
  const path = resolve(root, "." + decodeURIComponent(reference));
  assert.ok(existsSync(path) || existsSync(resolve(path, "index.html")), `Missing built destination: ${reference}`);
}
for (const path of ["index.html", "posts/index.html", "moments/index.html", "archives/index.html", "search/index.html", "rss.xml", "sitemap-index.xml", "pagefind/pagefind.js"]) {
  assert.ok(existsSync(resolve(root, path)), `Missing public entry: ${path}`);
}
console.log(`Verified ${pages.length} pages, their internal destinations, and ${references.size} asset/font references.`);
