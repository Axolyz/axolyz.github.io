import test from "node:test";
import assert from "node:assert/strict";
import { satteri } from "@astrojs/markdown-satteri";
import { normalizeMediaUrl, obsidianPlugin } from "../src/publishing/obsidian-markdown.mjs";

test("Enveloppe cover properties resolve to public media URLs", () => {
  assert.equal(normalizeMediaUrl("[photo.webp](/public/blog-media/photo.webp)"), "/blog-media/photo.webp");
  assert.equal(normalizeMediaUrl("/blog-media/photo.webp"), "/blog-media/photo.webp");
});

test("Sätteri applies URL mutations and preserves foldable Obsidian callouts", async () => {
  const renderer = await satteri({ mdastPlugins: [obsidianPlugin] }).createRenderer({});
  const { code } = await renderer.render([
    "[Article](/src/content/posts/Folder/Note.md#A%20Heading)",
    "[Moment](/src/content/moments/An-Entry.md)",
    "![Photo](/public/blog-media/photo.webp)",
    "> [!note]- Closed\n> Kept body.",
    "> [!tip]+ Open\n> Kept body.",
  ].join("\n\n"));
  assert.match(code, /href="\/posts\/folder\/note\/#a-heading"/);
  assert.match(code, /href="\/moments\/#moment-an-entry"/);
  assert.match(code, /src="\/blog-media\/photo.webp"/);
  assert.match(code, /<details[^>]*data-callout="note"[^>]*>/);
  assert.match(code, /<details[^>]*data-callout="tip"[^>]*open/);
  assert.match(code, /<summary[^>]*>Closed<\/summary>/);
  assert.doesNotMatch(code, /\/src\/content\/|\/public\/blog-media\//);
});

test("post preview uses the first content image, ignoring code samples and later images", async () => {
  const renderer = await satteri({ mdastPlugins: [obsidianPlugin] }).createRenderer({});
  const { metadata, code } = await renderer.render([
    "```md\n![Only a code sample](/sample.png)\n```",
    "![First photo](/public/blog-media/first.webp)",
    "![Second photo](/public/blog-media/second.webp)",
  ].join("\n\n"));
  assert.deepEqual(metadata.frontmatter.firstContentImage, { src: "/blog-media/first.webp", alt: "First photo" });
  assert.match(code, /src="\/blog-media\/first.webp"/);
  assert.match(code, /src="\/blog-media\/second.webp"/);
  const plain = await renderer.render("An article without an image.");
  assert.equal(plain.metadata.frontmatter.firstContentImage, undefined);
});
