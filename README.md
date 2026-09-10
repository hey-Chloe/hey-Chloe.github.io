# 李晨悦 · 学术与技术主页

基于 Next.js App Router、TypeScript、Tailwind CSS 和 MDX，支持 GitHub Pages 与 Vercel 静态部署。以研究问题、方法与结果为主线，采用单栏学术版式、左侧本人照片、中文姓名、衬线章节标题与白色背景。默认中文，右上角可切换至英文。

版式参考 [Rui Huang 的学术主页](https://ruihuangai.github.io/)，保留 [Huntr](https://huntr.co/resume-examples/software-engineer-resume-examples) 的淡黄色正文 hover 与文字选中效果，并支持键盘访问和减少动态效果偏好。

**内容状态：**已从 hey-Chloe 的公开 GitHub 仓库整理 3 个研究项目、2 个工程项目与 3 项开源记录；GitHub、邮箱、肖像和江南大学 2028 届本科背景均有公开来源。详细依据与结果边界见 [content/CONTENT-SOURCES.md](content/CONTENT-SOURCES.md)。论文、行业经历、原创研究笔记、Scholar 和 CV 仍待补充，不生成虚构条目。待办集中于 [content/TODO.json](content/TODO.json)。

## 本地运行

需要 Node.js 22 或更新版本与 npm。以下命令在本目录执行。

```bash
npm ci
cp .env.example .env.local
npm run dev
```

开发页面位于 <http://localhost:3000>。`.env.example` 使用已核验的现有个人域名 `https://hey-chloe.github.io`。纯本地开发也可以留空；留空构建会禁止搜索引擎收录。发布到其他域名或仓库路径前必须修改配置。

构建并预览生产静态文件：

```bash
npm run build
npm start
```

`npm run build` 生成 `out/`，`npm start` 预览该目录，默认端口为 3000。页面采用 `trailingSlash: true`，例如 `/research/` 对应 `out/research/index.html`。无需应用服务器或数据库；MDX 在构建时编译。[Next.js 静态导出说明](https://nextjs.org/docs/app/guides/static-exports)

## 页面与内容目录

| 页面 | 内容来源 |
| --- | --- |
| `/` | Profile、研究、经历、论文、开源、工程和写作摘要 |
| `/research/`、`/research/[slug]/` | `data/research.ts` |
| `/publications/` | `data/publications.ts` |
| `/experience/` | `data/experience.ts` |
| `/projects/` | `data/projects.ts`、`data/open-source.ts` |
| `/writing/`、`/writing/[slug]/` | `content/writing/*.mdx` |
| `/cv/` | `data/profile.ts` 与真实 CV 文件 |

所有数据类型在 [data/types.ts](data/types.ts)，编辑内容不需要改动 React 组件。界面文案与兴趣描述在 `data/site-copy.ts`。兴趣描述不代表已经完成的工作。个人简介与已核实教育信息位于 `data/profile.ts` 的 `biography`、`education` 字段。

## 中文与英文

默认路由为中文，英文对应路径带 `/en` 前缀，例如 `/research/ordered-agent-credit/` 与 `/en/research/ordered-agent-credit/`。语言按钮保留当前页面；两种版本都是构建时输出的独立静态 HTML，含正确的 `html lang`、canonical、hreflang 和 sitemap。无需服务端翻译 API、Cookie 或中间件。

- 中文事实与内容：`data/profile.ts` 和原有四个内容文件。
- 英文研究、项目与开源文案：`data/en.ts`，通过相同 ID / slug 关联，复用证据链接与图片。
- 双语界面标签与路径处理：`lib/localization.ts`。
- 新增内容后同时维护英文翻译；没有翻译的新记录保留原文，不能当作已翻译内容。MDX 文章默认保留原始语言，英文页面会明确标识。

## 更新身份、链接和 CV

编辑 `data/profile.ts`，按真实资料补齐 `github`、`scholar`、`email` 和 `cv`。邮箱只填地址，不加 `mailto:`；暂时不可用的字段直接省略。

把本人确认的 PDF 放入 `public/cv.pdf` 后，设置 `cv: "/cv.pdf"`。也可以使用真实 HTTPS 文件地址。不要把内容清单或空白模板当作 CV 发布。

## 新增研究项目

1. 使用 [content/templates/research.json](content/templates/research.json) 作为字段清单；模板本身不会发布。
2. 将完整、经过确认的记录加入 `data/research.ts`。`slug` 使用唯一的小写字母、数字与单连字符，例如实际项目名的英文缩写。
3. 填写 `title`、`question`、`method`、`keyResults`、`venue`、`status`。结果可以是有证据的定性结论，不要求编造数值。
4. 将有使用权的缩略图放入 `public/images/`，填写 `thumbnail.src`、描述性 `alt` 和真实像素尺寸。路径以 `/images/` 开头，不手动添加部署前缀。
5. 填写全部详情章节：Abstract、Problem、Method、Architecture、Dataset、Experiments、Results、Ablation、Failure Analysis、Demo、Citation。确实不适用的章节写明原因；尚未获得的信息继续留在 TODO 中。
6. 在 `links` 中只添加已经存在的 `paper`、`code`、`dataset`、`demo`、`project` 地址。缺失链接省略；至少保留一个支持该工作的真实链接。

重新构建后，自动生成独立详情页、列表条目与 sitemap 路径。没有已确认项目时，不发布示例项目。

## 新增论文

在 `data/publications.ts` 加入符合 `Publication` 类型的完整记录：

- `id`：唯一的小写连字符标识。
- `year`、`venue`、`title`：与正式论文或本人确认的状态一致。
- `authors`：保留原始作者顺序，且仅在本人作者上设置 `isSelf: true`，页面将加粗该姓名。
- `links`：真实的 `paper`、`code`、`project` 地址，不可用的字段省略。
- `bibtex`：完整条目，保留换行、引用键及必要字段。

年份按降序展示，预留 2027、2026、2025 分组；空分组不暗示有论文或已有录用。论文元数据与对应研究项目分别维护，以便一个研究项目关联多篇工作。

## 新增经历、开源贡献与工程项目

| 文件 | 填写重点 |
| --- | --- |
| `data/experience.ts` | Company、Role、Team、起止日期，以及 Problem、Ownership、Method、Scale、Result |
| `data/open-source.ts` | 实际 PR、本人维护的仓库或研究基础设施；具体贡献、结果、状态和证据链接 |
| `data/projects.ts` | 问题、本人负责的范围、描述、结果、年份与链接；技术标签是辅助信息 |

经历日期支持 `YYYY-MM` 或 `YYYY-MM-DD`；仅确认仍在职时省略 `endDate`。不能公开的规模或结果应说明披露限制，不用估算数字代替事实。`pull-request` 类型必须提供 `links.pullRequest`。贡献热图不能替代具体贡献记录。

## 发布 MDX Research Notes

```bash
cp content/templates/note.mdx content/writing/your-note-slug.mdx
```

将文件名改为真实文章 slug，补齐 frontmatter 中 `title`、`description`、`date`（必须使用带引号的字符串，如 `"2026-09-09"`）与 `tags`。保持 `draft: true` 进行编辑；内容核实完成后才设置 `draft: false`。未填写 `draft` 也默认为不发布，草稿不会生成文章页或进入 sitemap。

支持普通 Markdown、GFM 表格、`$...$` 行内数学、`$$...$$` 独立公式、带语言名称的代码块，以及以下现成组件：

```mdx
<Figure src="/images/your-figure.webp" alt="说明图中表达的信息" width={1200} height={720} caption="实际图注与来源" />

<Cite id="source">[1]</Cite>

<References>
  <Reference id="source">填写真实作者、标题、年份和原始来源链接。</Reference>
</References>
```

上面仅示意组件语法，不是可发布研究内容。引用 ID 在同篇文章内保持唯一；引用与文末条目配对。代码块、表格和长公式在自身容器内滚动。更多说明见 [content/writing/README.md](content/writing/README.md)。MDX 可以执行代码，因此只编译本人编写或审核过的仓库文件，不接入访客提交或远程未审核 MDX。

## 验证与质量目标

本次实际执行结果及环境限制见 [VERIFICATION.md](VERIFICATION.md)。

```bash
npm run check
```

依次执行 ESLint、TypeScript、内容测试、生产构建及本地死链检查。测试覆盖见 [tests/content-validation.test.ts](tests/content-validation.test.ts)。构建会拒绝重复 slug、未完成的公开记录、危险或示例 URL、非法日期等；验证器不能替代本人对经历与成果真实性的核实。

浏览器检查使用真实 Chromium。首次运行安装浏览器，然后先在另一个终端执行 `npm start`：

```bash
npx playwright install chromium
npm run check:browser
npm run audit:lighthouse
```

浏览器脚本覆盖 1440px 桌面、768px 平板、390px 手机与 320px 小屏，检查页面加载、console/runtime errors、资源加载、横向溢出、空链接、标题与 SEO 标签、键盘跳转、可用交互及 axe 无障碍规则，并保存截图与报告至 `work/qa/`。截图还应实际检查排版、留白、断行与视觉层级。

Lighthouse 目标为 **Performance、Accessibility、Best Practices、SEO 均 >95**。分数是目标，不是未经测量的交付保证；实际结果以当前生产构建的审计输出为准。网络、CPU、浏览器版本与新增内容会改变分数，正式域名部署后应再次运行。避免过大的图片，提供真实尺寸，控制客户端脚本和第三方资源。

预览服务支持协商 Brotli / gzip 文本压缩，保留正确的静态资源类型、HEAD 和 404 状态。GitHub Pages 与 Vercel 部署后的性能仍以实际域名复测为准。

本地死链检查默认核对导出的页面、锚点、图片、CSS 资源和必要 SEO 文件；需要网络验证外部论文或仓库时执行：

```bash
CHECK_EXTERNAL_LINKS=1 npm run check:links
```

部分外部站点可能限制自动请求，遇到 403 等响应应实际打开核实。未提供的个人链接不会被编造成待检测地址。

## SEO 与部署环境

| 构建变量 | 含义 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 正式站点 origin，包含 `https://` 与真实域名，不带仓库路径、查询或 hash |
| `NEXT_PUBLIC_BASE_PATH` | 根域部署留空；GitHub 项目站点填 `/实际仓库名` |

OpenGraph、Twitter Card、JSON-LD、canonical、sitemap 和 robots 由站点配置与内容生成。未配置正式域名时本地预览使用 localhost；正式发布前必须确认 URL。Vercel 上也可读取平台提供的 production hostname，但个人域名应显式配置。

这些变量在构建时生效，修改后必须重新构建。内容中的本地路径始终从 `/` 开始，应用统一添加 base path。QA 脚本的 `SITE_URL` 是测试服务 origin，`BASE_PATH` 是测试路径前缀；它们与上述构建变量作用不同。例如检查项目站点构建时：

```bash
BASE_PATH=/实际仓库名 npm run check:links
BASE_PATH=/实际仓库名 npm start
SITE_URL=http://127.0.0.1:3000 BASE_PATH=/实际仓库名 npm run check:browser
```

## 部署至 GitHub Pages

1. 将**本目录内容**放在目标 Git 仓库根目录，保留 `.github/`、锁文件和 `public/.nojekyll`。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。[GitHub 官方设置说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
3. 工作流默认使用 `https://OWNER.github.io` 作为 origin；普通仓库自动使用 `/REPO` 前缀，`OWNER.github.io` 仓库使用根路径。
4. 若使用自定义域名，在 **Settings → Secrets and variables → Actions → Variables** 设置 `NEXT_PUBLIC_SITE_URL`。配置该 origin 后，工作流默认采用空 base path；需要子路径时额外设置 `NEXT_PUBLIC_BASE_PATH`，显式 `/` 表示根路径。自定义域名还需要在 Pages 设置和 DNS 服务中完成实际配置。
5. 推送或 PR 触发安装、lint、typecheck、测试、构建、死链检查、真实浏览器与 Lighthouse 验证。工作流另外构建隔离的测试内容，检查研究详情、论文、MDX 和仓库子路径；测试内容不进入部署产物。只有默认分支且全部检查成功时才部署正式 `out/`；PR 只验证，不发布。`work/qa/` 中的截图与报告作为 Actions artifact 保存。

检查 Actions 的真实结果与站点地址后，再确认页面导航、静态资源、CV、sitemap 和 robots。在其他静态托管平台，同样上传整个 `out/` 并使用目录索引与生成的 `404.html`；不要把未知路径重写为返回 200 的首页。

## 部署至 Vercel

1. 导入代码仓库；若代码不在仓库根目录，将 **Root Directory** 指向包含 `package.json` 的目录。
2. 选择 **Next.js** 框架预设，使用 Node.js 22 或更新版本，安装命令 `npm ci`，构建命令 `npm run build`。保留框架自动检测的输出配置；项目本身通过 `output: "export"` 生成静态站点。[Vercel 构建配置说明](https://vercel.com/docs/builds/configure-a-build)
3. 设置真实 `NEXT_PUBLIC_SITE_URL`，`NEXT_PUBLIC_BASE_PATH` 留空，然后部署。启用自定义域名后，更新 origin 并重新构建。
4. 在实际部署 URL 上检查主要页面与链接，重新运行浏览器检查和 Lighthouse。

当前正式站点部署于 [https://hey-chloe.github.io/](https://hey-chloe.github.io/)，每次默认分支更新都必须通过完整验证后才会发布。

## 更新研究图表

首页缩略图使用真实公开实验报告的论文式结果图，详细数据与来源保存在 `content/figure-data.json`，PNG 为网页资源，SVG 可用于高分辨率导出。重新绘图需要 Python 3 与固定版本的 matplotlib：

```bash
python3 -m pip install matplotlib==3.11.1
CHART_FONT=/absolute/path/to/cjk-font.ttc python3 scripts/generate-research-figures.py
CHART_LANGUAGE=en python3 scripts/generate-research-figures.py
```

中文图缺少可用 CJK 字体时脚本会直接失败，防止中文文件静默生成英文标签。运行两条生成命令后，应同时提交 6 个 PNG 与 6 个 SVG。更新数据时保留原始来源、指标定义、样本范围和不确定性，不将离线图表写成线上业务收益。
