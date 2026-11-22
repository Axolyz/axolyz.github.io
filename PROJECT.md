---
type: static-blog
summary: 東雲暁月的个人博客，从 Obsidian 一键发布文章与动态，以 AstroSage 和 GitHub Pages 构建托管。
tags:
  - blog
  - obsidian
  - astro
---

# 東雲暁月

工程长期位于 `~/Documents/Workspaces/personal-blog`，线上入口为 https://axolyz.github.io/ ，仓库为 `Axolyz/axolyz.github.io`。从 `main` 由 GitHub Actions 测试、构建并部署 Pages。无需本机参与构建。

写作原稿在 Obsidian Vault 的 `Writing/Blog/` 和 `Writing/Moments/`，通过 Enveloppe 发布到 `src/content/posts/`、`src/content/moments/`，图片在 `public/blog-media/`。快捷键 ⌘⌥B / ⌘⌥M 新建、⌘⌥P 发布。模板和完整说明只维护在 Vault/Writing，统一日期为 `pubDatetime`。

主题为固定 npm 版本 AstroSage 0.2.1；保留原生文章头、正文、目录及路由，通过集中源码适配添加固定头图、首图预览、动态和少量外观调整。配色交互参考 Sumi。英文阅读用 Newsreader、中日阅读与站名用普通筑紫明朝、UI 和代码用 Maple Mono，中文斜体用正体霞鹜文楷。用户于 2026-11-22 确认网页字体授权，网页分片随工程版本控制，原始桌面字库不入库。

维护入口为 README.md、sage.config.ts 和 src/theme/source-adaptations.ts。运行 `pnpm dev` 开发，`pnpm test` / `pnpm build` 验证，`pnpm theme:check` 检查上游。布局测试文章已移除，About 按用户要求保留主题默认内容。
