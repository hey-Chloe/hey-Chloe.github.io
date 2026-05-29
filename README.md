# SakuraSec 🎀

一个「少女风格 + 安全研究 + CTF 平台 + MDX 博客 + 管理后台」的完整全栈项目，适合 GitHub 展示、面试作品集与个人安全研究站点。

它不是传统深色黑客风，而是把安全研究的理性、CTF 的工程感和柔和少女审美融合在一起：淡紫、粉色、蓝紫渐变、毛玻璃、柔阴影、微光粒子背景与轻量动画。

## 技术栈

- Next.js 14+ App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- MDX 博客渲染
- Prisma + SQLite（可切换 PostgreSQL）
- JWT 登录系统（httpOnly Cookie + `jose`）
- Framer Motion 页面与卡片动效
- Zustand 状态管理
- RSS / Sitemap / Robots / OpenGraph SEO

## 亮点

- 首页 Hero 内置循环打字机情绪句子系统
- JWT 管理员登录：`/admin/login`
- Middleware + 服务端校验双层保护后台
- 后台支持博客、CTF、作品、友链管理
- 博客支持 MDX、标签、阅读时间、TOC、上一篇/下一篇
- CTF 支持 Web / Pwn / Crypto / Reverse / Misc 分类、Payload/Exp、Writeup、知识点总结
- 少女风友链卡片：毛玻璃、hover 浮动与发光
- 作品集：GitHub、Demo、标签、技术栈
- 可直接部署 Vercel，生产环境建议使用 PostgreSQL

## 本地运行

```bash
pnpm install
cp .env.example .env
pnpm db:push
pnpm db:seed
pnpm dev
```

访问：

- 前台：`http://localhost:3000`
- 后台登录：`http://localhost:3000/admin/login`

## 默认管理员

```txt
email: admin@sakura.dev
password: Sakura@123456
```

登录成功后会写入 `sakura_token` httpOnly Cookie。

## 项目结构

```txt
sakura-sec/
├── app/
│   ├── admin/                 # 管理后台与登录页
│   ├── api/                   # JWT 登录与后台 CRUD API
│   ├── blog/                  # 博客列表与详情
│   ├── ctf/                   # CTF 列表与详情
│   ├── friends/               # 友链页面
│   ├── projects/              # 作品集页面
│   ├── rss.xml/route.ts       # RSS Feed
│   ├── sitemap.ts             # Sitemap
│   ├── robots.ts              # Robots
│   ├── layout.tsx             # 全局布局与 metadata
│   ├── page.tsx               # 首页 Hero
│   └── template.tsx           # 页面切换动画
├── components/
│   ├── layout/                # 导航、页脚、背景粒子
│   ├── mdx/                   # MDX 组件
│   ├── motion/                # Framer Motion 封装
│   ├── sections/              # 首页区块
│   └── ui/                    # shadcn/ui 风格组件
├── lib/
│   ├── auth.ts                # JWT 签发/校验/权限
│   ├── db.ts                  # Prisma Client
│   ├── mdx.ts                 # TOC/阅读时间/标签处理
│   ├── site.ts                # SEO 配置
│   └── utils.ts               # 工具函数
├── prisma/
│   ├── schema.prisma          # 数据模型
│   └── seed.ts                # 种子数据
├── stores/
│   └── use-ui-store.ts        # Zustand 状态
├── middleware.ts              # 后台权限保护
└── tailwind.config.ts
```

## 数据模型

Prisma 中包含以下核心模型：

- `User`
- `Post`
- `CtfTask`
- `Project`
- `Friend`

标签使用 JSON 字符串保存，便于 SQLite 与 PostgreSQL 双端兼容。

## 环境变量

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

生产环境请设置强随机 `JWT_SECRET`，并建议改用 PostgreSQL：

```prisma
provider = "postgresql"
```

## 部署 Vercel

1. 上传项目到 GitHub。
2. 在 Vercel 导入仓库。
3. 配置环境变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
4. 生产环境建议接入 Neon / Supabase PostgreSQL。
5. Build Command 保持：`prisma generate && next build`。

## 可扩展方向

- AI 自动生成 CTF Writeup 草稿
- 接入对象存储上传图片
- 做成真正的 CMS：草稿、发布流、版本历史
- 接入在线靶场容器：Docker + 队列 + Flag 校验
- 增加搜索：Meilisearch / Postgres FTS
- 多用户与 RBAC：Admin / Editor / Guest
- 访客留言、友链申请审核

## 安全说明

- JWT 存放在 httpOnly Cookie，降低 XSS 读取 token 的风险。
- Middleware 保护 `/admin` 与 `/api/admin`。
- 服务端 API 内仍进行 `requireApiAdmin()` 二次校验。
- 密码使用 bcrypt hash 存储。
- 生产环境必须使用 HTTPS、强 `JWT_SECRET`、安全数据库连接与日志审计。
