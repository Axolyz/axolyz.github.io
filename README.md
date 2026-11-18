# Axolyz 的博客

## 写作与发布

在 Obsidian 的 `Writing/Blog/` 写文章，用 Properties 设置 `title`、`published`（日期）和 `publish`（勾选）。打开文章后运行 Enveloppe 的单篇发布命令。首次配置时，在 Enveloppe 的 **GitHub token** 字段选择一个 Obsidian Secret，值为仅授权给 `Axolyz/axolyz.github.io` 的 GitHub fine-grained PAT，仓库权限为 Contents 和 Pull requests 的 Read and write。

Enveloppe 将 Markdown 发送到 `shirones/content/posts/`，将正文配图发送到 `public/blog-media/`，并合入 `main`。GitHub Actions 随后部署站点。已经发布的文章可以重新运行同一个命令更新。正文笔记链接指向也已标记发布的笔记，Obsidian 笔记嵌入在发布配置中关闭。

## 动态

在 Obsidian 按 **⌘⌥M**，运行 `Templater: Create Writing/Moment Template`。模板会自动创建 `Writing/Moments/` 下以时间命名的笔记，并填写带时区的 `published`。写正文或粘贴图片后，勾选 `publish`，按 **⌘⌥P** 发布。更新动态时再次发布同一篇笔记。

Enveloppe 将动态发送到 `shirones/content/moments/`，配图共用 `public/blog-media/`。站点的“动态”入口为 `/moments/`，按时间倒序显示。可选 Properties 为 `tags`（列表）、`location`（文本）和 `pinned`（复选框）。

`src/pages/moments.astro` 复用主题的动态卡片和布局，通过共享的 Obsidian Markdown 处理器转换正文。主题默认的 `/moments` 路由在 `astro.config.mjs` 中排除。更新主题时一并检查该页面的渲染接口。

## 本地开发

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

Node 版本见 `.node-version`，pnpm 版本见 `package.json`。主题作为 `shirones` npm 依赖安装。站点与主题配置在 `shirones/config/`，正文的 Obsidian 兼容规则在 `src/publishing/obsidian-markdown.mjs`。

需要改组件或布局时，按上游路径在 `src/components/` 或 `src/layouts/` 增加同名覆盖，或在 `astro.config.mjs` 的 `shirones()` 参数中显式指定组件路径。[Shirone npm 包指南](https://docs.shirone.mysqil.com/en/guide/npm-package/)
