import { unified } from "@astrojs/markdown-remark";
import { slug } from "github-slugger";
import { visit } from "unist-util-visit";

const calloutTypes = new Set(["note", "info", "tip", "important", "warning", "caution"]);

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function mediaUrl(url) {
  const source = url.replace(/^\/?(?:\.\.\/|\.\/)*?public\/blog-media\//, "/blog-media/");
  return source;
}

function noteUrl(url) {
  const match = url.match(/^\/?(?:\.\.\/|\.\/)*shirones\/content\/(posts|moments)\/(.+)$/);
  if (!match) return url;

  const [, collection, path] = match;
  const [file, anchor] = path.split("#", 2);
  if (!/\.mdx?$/i.test(file)) return url;

  const id = decode(file).replace(/\.mdx?$/i, "").split("/").map((part) => slug(part)).join("/")
    .replace(/\/index$/, "");
  const fragment = anchor ? "#" + encodeURIComponent(slug(decode(anchor))) : "";
  if (collection === "moments") {
    return "/moments/" + (fragment || "#moment-" + encodeURIComponent(id));
  }
  return "/posts/" + id.split("/").map(encodeURIComponent).join("/") + "/" + fragment;
}

function normalizeCallout(node) {
  const [paragraph, ...blocks] = node.children;
  const first = paragraph?.type === "paragraph" ? paragraph.children[0] : null;
  if (first?.type !== "text") return;

  const [header, ...lines] = first.value.split("\n");
  const match = header.match(/^\[!([\w-]+)\]([+-])?[ \t]*(.*)$/i);
  if (!match) return;

  const [, rawType, folded, title] = match;
  const kind = rawType.toLowerCase();
  if (!folded && !title && ["note", "tip", "important", "warning", "caution"].includes(kind)) return;

  const body = lines.join("\n");
  const inline = [...(body ? [{ ...first, value: body }] : []), ...paragraph.children.slice(1)];
  const displayTitle = title || rawType.charAt(0).toUpperCase() + rawType.slice(1);
  Object.assign(node, {
    type: "containerDirective",
    name: folded ? "admonition-details" : calloutTypes.has(kind) ? kind : "note",
    attributes: { title: displayTitle },
    children: [
      ...(inline.length ? [{ ...paragraph, children: inline }] : []),
      ...blocks,
    ],
  });
}

function convertExportedNotes() {
  return (tree) => {
    visit(tree, "link", (node) => { node.url = mediaUrl(noteUrl(node.url)); });
    visit(tree, "image", (node) => { node.url = mediaUrl(node.url); });
    visit(tree, "blockquote", normalizeCallout);
  };
}

export function createObsidianProcessor(options) {
  return unified({
    ...options,
    remarkPlugins: [convertExportedNotes, ...options.remarkPlugins],
  });
}

export function obsidianMarkdown() {
  return {
    name: "blog-obsidian-markdown",
    hooks: {
      "astro:config:setup": ({ config, updateConfig }) => {
        const { options } = config.markdown.processor;
        updateConfig({
          markdown: {
            processor: createObsidianProcessor(options),
          },
        });
      },
    },
  };
}
