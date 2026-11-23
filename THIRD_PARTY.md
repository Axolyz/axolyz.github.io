# Theme sources

The site uses AstroSage as a pinned npm dependency. Its source and bundled dependencies retain their own licenses.

Small site-owned palette overrides draw on Interleaf and Sumi. Layouts are provided by AstroSage. Reference revisions are recorded in `theme-sources.json`. About content is restored from the pinned AstroSage demo; showcase links target its official website.

The site uses Newsreader for all Latin reading text (including titles), ordinary FZFW Tsukushi Mincho SC first and Fontworks Tsukushi Mincho Pro JP for missing CJK glyphs (not Tsukushi A Old Mincho). The header wordmark explicitly uses the Tsukushi CJK stack; UI and code use Maple Mono (SIL Open Font License 1.1, as recorded in the source font). The owner confirmed Tsukushi webfont authorization on 2026-11-22. Generated Unicode-range WOFF2 subsets are stored in `src/assets/fonts/custom`; desktop originals are not included. Source copyright/license metadata is preserved. These commercial subsets retain their original restrictions; the repository's code license grants no independent rights to redistribute them. Maple Mono's full OFL license is distributed at `public/fonts/MapleMono-OFL.txt`.

The Chinese fallback uses [Noto Serif SC](https://github.com/notofonts/noto-cjk), SIL Open Font License 1.1, via `@fontsource-variable/noto-serif-sc`. Fontsource ships Unicode-range WOFF2 subsets. Its license is distributed at `public/fonts/NotoSerifSC-OFL.txt`. Newsreader is provided by AstroSage.

CJK emphasis uses upright [LXGW WenKai](https://github.com/lxgw/LxgwWenKai), SIL Open Font License 1.1, through [lxgw-wenkai-webfont](https://github.com/chawyehsu/lxgw-wenkai-webfont) 1.7.0 (font version 1.250; webfont packaging MIT © 2021 Chawye Hsu). The site maps the existing regular/bold CSS subsets to italic faces of its CJK fallback family; font files and their internal names remain unchanged. Font and packaging licenses are distributed at `public/fonts/LXGWWenKai-OFL.txt` and `public/fonts/LXGWWenKai-Webfont-MIT.txt`.

- [AstroSage](https://github.com/chintak/astro-sage), MIT, Chintak Sheth.
- [Interleaf](https://github.com/DRAG0NM/astro-theme-interleaf), MIT, original Retypeset copyright © 2025 radishzz, modifications by Drag0nM.
- [Sumi](https://github.com/kpab/astro-sumi), MIT, kpab.
- [AstroPaper](https://github.com/satnaing/astro-paper), MIT, Sat Naing, the original lineage of AstroSage.

The default social-preview image was generated for this site and is stored as `public/og-default.webp`.

The fixed site banner `public/site-cover.png` is the user's supplied `99012779_p0.png`, copied without modification. Its creator and original publication are not identified in this repository; the visible signature remains in the original asset. It is separate from the generated default social-preview image and article body images.

The current browser favicon is the small upper-left purple-dress doll from the user-supplied `124362856_p0.jpg`, retained as `src/assets/brand/favicon-reference.jpg`. Its transparent edit is `favicon-doll.png`. The icon generator removes transparent margins and scales proportionally to fill the full vertical axis, keeping the complete character and natural side margins. The earlier source and full-doll cutout remain as reference assets, separate from the active icon. This artwork is separate from the site cover and social preview image.
