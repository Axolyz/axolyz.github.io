import { slug } from "github-slugger";

export function normalizeMediaUrl(value) {
  const link = value.match(/^\[[\s\S]*\]\(([\s\S]+)\)$/);
  const url = link ? link[1] : value;
  return url.replace(/^\/?(?:\.\.\/|\.\/)*public\/blog-media\//, "/blog-media/");
}

function decode(value) {
  try { return decodeURIComponent(value); } catch { return value; }
}

export function publishedNoteUrl(value) {
  const match = value.match(/^\/?(?:\.\.\/|\.\/)*src\/content\/(posts|moments)\/(.+)$/);
  if (!match) return value;
  const [, collection, path] = match;
  const [filename, heading] = path.split("#", 2);
  if (!/\.mdx?$/i.test(filename)) return value;
  const id = decode(filename).replace(/\.mdx?$/i, "").split("/").map(part => slug(part)).join("/").replace(/\/index$/, "");
  const anchor = heading ? "#" + encodeURIComponent(slug(decode(heading))) : "";
  if (collection === "moments") return "/moments/" + (anchor || "#moment-" + encodeURIComponent(id));
  return "/posts/" + id.split("/").map(encodeURIComponent).join("/") + "/" + anchor;
}

function element(name, properties, children, mdx) {
  if (mdx) {
    return {
      type: "mdxJsxFlowElement", name,
      attributes: Object.entries(properties).map(([key, value]) => ({
        type: "mdxJsxAttribute", name: key === "className" ? "class" : key,
        value: value === true ? null : String(value),
      })),
      children,
    };
  }
  const type = name === "p" || name === "summary" ? "paragraph" : "blockquote";
  return { type, data: { hName: name, hProperties: properties }, children };
}

/** Sätteri plugin shared by articles, moments, feeds, and search. */
export const obsidianPlugin = {
  name: "axolyz-obsidian-publishing",
  link(node, context) { context.setProperty(node, "url", normalizeMediaUrl(publishedNoteUrl(node.url))); },
  image(node, context) {
    const url = normalizeMediaUrl(node.url);
    context.setProperty(node, "url", url);
    const frontmatter = context.data.astro?.frontmatter;
    if (frontmatter && !frontmatter.firstContentImage) {
      frontmatter.firstContentImage = { src: url, alt: node.alt ?? "" };
    }
  },
  blockquote(node, context) {
    const first = node.children[0];
    const text = first?.type === "paragraph" && first.children[0]?.type === "text" ? first.children[0] : null;
    const match = text?.value.match(/^\[!([\w-]+)\]([+-])?[^\S\n]*(.*)(?:\n|$)/);
    if (!match) return;
    const [, type, folded, title] = match;
    const rest = text.value.slice(match[0].length);
    const inline = [...first.children];
    if (rest) inline[0] = { ...text, value: rest };
    else inline.shift();
    const body = [...node.children.slice(1)];
    if (inline.length) body.unshift({ type: "paragraph", children: inline });
    const mdx = context.sourceFormat === "mdx";
    const properties = { className: "callout", "data-callout": type.toLowerCase() };
    if (folded === "+") properties.open = true;
    context.replaceNode(node, element(folded ? "details" : "aside", properties, [
      element(folded ? "summary" : "p", { className: "callout-title" }, [{ type: "text", value: title || type }], mdx),
      element("div", { className: "callout-body" }, body, mdx),
    ], mdx));
  },
};
