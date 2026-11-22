import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineSageCollections } from "astro-sage/content";

const sage = defineSageCollections({ author: "Axolyz" });

const posts = defineCollection({
  ...sage.posts,
  schema: (context) => {
    const inherited = typeof sage.posts.schema === "function" ? sage.posts.schema(context) : sage.posts.schema!;
    return inherited.extend({
      pubDatetime: z.coerce.date(),
      description: z.string().nullish().transform(value => value ?? ""),
      tags: z.array(z.string()).nullish().transform(value => value ?? []),
    });
  },
});

const moments = defineCollection({
  loader: glob({ base: "./src/content/moments", pattern: "**/*.md" }),
  schema: z.object({
    pubDatetime: z.coerce.date(),
    draft: z.boolean().default(false),
    pinned: z.boolean().default(false),
    tags: z.array(z.string()).nullish().transform(value => value ?? []),
    location: z.string().nullish().transform(value => value ?? ""),
  }),
});
export const collections = { ...sage, posts, moments };
