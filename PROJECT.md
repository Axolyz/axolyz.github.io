---
type: static-blog
summary: Axolyz 的个人博客，从 Obsidian 选发文章与动态，由 Shirone 构建并部署到 GitHub Pages。
tags:
  - blog
  - obsidian
  - astro
---

# Axolyz 的博客

- [站点](https://axolyz.github.io/)由 [GitHub Actions](https://github.com/Axolyz/axolyz.github.io/actions) 从 `main` 构建。
- 文章原稿在本机 Obsidian 的 `Writing/Blog/`。Enveloppe 将选中的文章复制到 `shirones/content/posts/`，将配图复制到 `public/blog-media/`。
- 动态原稿在 `Writing/Moments/`，发布到 `shirones/content/moments/`。Obsidian 的 **⌘⌥M** 新建动态，**⌘⌥P** 发布当前文章或动态。快捷键和目录映射保存在本机 Obsidian 插件设置中。
- 本地开发入口是 `pnpm dev`，生产构建使用 `pnpm build`。Node 和 pnpm 版本见 `.node-version` 和 `package.json`。
- 站点配置在 `shirones/config/`。新增组件和布局可以放在 `src/`，主题覆盖方式见 README。
