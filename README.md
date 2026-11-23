# 東雲暁月

个人静态博客：[axolyz.github.io](https://axolyz.github.io/)。工程长期放在 `~/Documents/Workspaces/personal-blog`；原稿留在 Obsidian Vault。主题是锁定版本的 npm `astro-sage`，不维护一份上游代码副本。

## 写作与发布

在 Obsidian 按 **⌘⌥B** 新建文章，**⌘⌥M** 新建动态。写完勾选 `publish`，按 **⌘⌥P** 发布当前笔记；Enveloppe 创建并合并 PR，GitHub Actions 构建后更新 GitHub Pages。

- `Writing/Blog/` → `src/content/posts/`
- `Writing/Moments/` → `src/content/moments/`
- 正文配图 → `public/blog-media/`

文章和动态接入仅使用上述目录与新字段。既有内容已一次性转换，不保留旧日期字段、旧主题目录或封面属性的运行时兼容层。

模板和完整操作说明只维护在 Vault 的 `Writing/Blog Post Template.md`、`Writing/Moment Template.md` 和 `Writing/Publishing.md`。两种内容统一使用带时区的 `pubDatetime`；`draft: true` 和未来日期不会发布。文章还需 `title`，可选 `description`、`tags`、`series`；动态可选 `tags`、`location`、`pinned`。

直接在正文粘贴图片即可，列表自动读取正文第一张图作为预览，不需要 `cover` 或 `image` 字段。正文保留原图比例，列表生成响应式 WebP；Archives 保留纯文字。图片代码示例不参与首图提取。全站固定头图单独设置，文章首图不会替换它。头图在 head 预加载、同步解码，并作为独立的原生页面过渡层保持显示，避免切页时露出深色底。

## 维护入口

- `sage.config.ts`：站点身份、功能、主题选项。
- `src/theme/integration.ts`：构建生命周期与 Markdown 衔接。
- `src/theme/source-adaptations.ts`：集中维护对 npm 主题源码的小幅适配，升级不匹配时明确报错。文章头、网格、目录和正文排版继续使用 AstroSage 原版。
- `src/theme/visuals.ts`、`src/components/CoverHero.astro`：固定通栏头图、统一尺寸与焦点。首页及导航页标题叠图，标题组在导航分隔线与图片底边之间居中；文章标题和元信息在图下。
- `src/styles/overrides.css`：Sumi 参考配色与交互；`covers.css`：头图、月牙、斜切预览与列表宽度；`typography.css`：字体分工。
- `src/publishing/obsidian-markdown.mjs`：Enveloppe 链接、图片、折叠 Callout 与首图元数据。
- `src/content/`：发布副本及默认 About；`public/`：站点图片与公开附件。

所有文章预览列表（首页、Posts/分页、系列详情、标签详情）在原生外框内扩展到最多 60rem；纯目录、Archives、Search、Moments、About 与文章正文保持原生阅读宽度。带图条目整块可点击，悬停范围与图同高；系列链接独立，图片下沿贴分隔线。桌面右图占 36%，首选比例 16:9，单边斜切。

默认 English UI。阅读文字含标题：英文 Newsreader，中文普通方正 FW 筑紫明朝，缺字回退日文 Fontworks 筑紫明朝 Pro；不使用筑紫A老明朝，不需要逐段标语言。中文斜体显示正体霞鹜文楷，英文保留 Newsreader 真斜体。UI 与代码使用 Maple Mono，左上角站名单独固定为筑紫明朝，朱红月牙紧贴右下角。

常态文字保持墨色，朱红用于下划线、边线、焦点和悬停。明暗配色与动效见样式文件；浅色头图较亮、暗色遮罩较深。页内图片直角。About 按用户要求保留 AstroSage 默认示例内容。

## 本地开发与自动构建

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

Node / pnpm 版本由 `.node-version` / `package.json` 固定。构建包含 Astro 类型检查、静态生成、Pagefind 搜索索引，以及头图／原生文章结构／内部目标和字体文件的产物检查。GitHub Actions 在 `main` 更新时执行同样的测试和构建，再部署 Pages；无需本地构建后上传。

网页字体分片位于 `src/assets/fonts/custom/`，已纳入版本控制，CI 不依赖本机字库或预览缓存。用户于 2026-11-22 确认筑紫明朝的网页授权。原始桌面字库不进仓库；网页分片仍受各自授权约束，不因仓库代码许可而变成可自由再分发。许可与来源见 `THIRD_PARTY.md` 和 `public/fonts/`。

仅在需要重新生成分片时运行：

```sh
uv run --with 'fonttools[woff]' python scripts/prepare-fonts.py
```

脚本读取 `~/Documents/fonts`（可用 `--library` 指定），保留 OpenType 特性和版权元数据，输出 WOFF2 与 CSS；生成签名只存在忽略的 `.sage-cache/fonts/manifest.json`。普通开发、CI 和发布不运行此步骤。

## 更新上游

```sh
pnpm theme:check
```

`theme-sources.json` 记录 AstroSage、Interleaf、Sumi 和 AstroPaper 的参考版本。AstroSage 是运行依赖，另三者是设计或沿革参考，不合并它们的整站代码。更新主题后检查源码适配、首页/文章/动态/搜索、明暗模式与移动端，再更新记录版本。源码适配只触及导航、头图、列表宽度、日期图标、字体加载与元信息，不覆盖文章排版。

浏览器图标使用原图右上角人偶的透明抠图。原图和抠图保存在 `src/assets/brand/`；运行 `node scripts/prepare-icons.mjs` 生成多尺寸 `public/favicon.ico`、512px PNG 和 Apple touch icon。主题自动识别这些文件，无需修改上游布局。
