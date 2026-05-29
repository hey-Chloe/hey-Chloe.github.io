import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { stringifyTags } from '../lib/utils'

const prisma = new PrismaClient()

const introMdx = `# 从一朵樱花开始的安全研究笔记

> 安全研究不一定只有黑底绿字，也可以有柔和的色彩、清晰的逻辑和一点点少女心。

## 为什么做 SakuraSec

SakuraSec 是一个面向个人展示与知识沉淀的全栈站点。它同时承载博客、CTF Writeup、项目作品集和友链。

## 一段 Web 安全示例

下面是一个非常基础的输入过滤示例：

\`\`\`ts
export function escapeHTML(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
\`\`\`

## 继续前进

每一次复盘，都是把断桨重新磨亮。`;

const jwtMdx = `# JWT 登录系统安全设计

## 核心目标

JWT 登录系统的重点不是“能登录”，而是要尽量减少 token 泄露、权限绕过和服务端信任边界模糊。

## 推荐策略

- 使用 httpOnly Cookie 保存 JWT
- 开启 SameSite=Lax
- 生产环境强制 Secure
- 服务端 API 做二次权限校验
- 管理端路由使用 Middleware 做第一层拦截

## 示例 Payload

\`\`\`json
{
  "sub": "user-id",
  "email": "admin@sakura.dev",
  "role": "ADMIN"
}
\`\`\`

## 总结

不要把权限判断只放在前端。前端只是体验，服务端才是边界。`;

async function main() {
  const passwordHash = await bcrypt.hash('Sakura@123456', 12)

  await prisma.user.upsert({
    where: { email: 'admin@sakura.dev' },
    update: { passwordHash },
    create: {
      email: 'admin@sakura.dev',
      name: 'Sakura Admin',
      passwordHash,
      role: 'ADMIN'
    }
  })

  await prisma.post.upsert({
    where: { slug: 'hello-sakura-sec' },
    update: {},
    create: {
      slug: 'hello-sakura-sec',
      title: '从一朵樱花开始的安全研究笔记',
      excerpt: '用少女风审美记录安全研究、CTF 与工程化实践。',
      content: introMdx,
      tagsJson: stringifyTags(['security', 'web', 'life']),
      published: true
    }
  })

  await prisma.post.upsert({
    where: { slug: 'jwt-auth-design' },
    update: {},
    create: {
      slug: 'jwt-auth-design',
      title: 'JWT 登录系统安全设计',
      excerpt: '用 httpOnly Cookie、Middleware 与服务端校验构建安全后台。',
      content: jwtMdx,
      tagsJson: stringifyTags(['security', 'jwt', 'web']),
      published: true
    }
  })

  await prisma.ctfTask.upsert({
    where: { slug: 'web-easy-filter-bypass' },
    update: {},
    create: {
      slug: 'web-easy-filter-bypass',
      title: 'Web Easy - Filter Bypass',
      category: 'Web',
      difficulty: 'Easy',
      description: '一个基础的过滤绕过题，目标是理解黑名单过滤的脆弱性。',
      analysis: '题目对关键字进行了简单 replace，但没有做大小写归一和上下文编码。可以通过大小写混合、事件属性或编码绕过。',
      payload: '<img src=x onerror=alert(1)>',
      exp: `const payload = '<img src=x onerror=alert(1)>'\nfetch('/submit', { method: 'POST', body: JSON.stringify({ payload }) })`,
      summary: '过滤不是安全边界。真正的防护需要上下文编码、CSP 与服务端白名单策略。',
      tagsJson: stringifyTags(['xss', 'filter', 'web']),
      published: true
    }
  })

  await prisma.ctfTask.upsert({
    where: { slug: 'crypto-baby-xor' },
    update: {},
    create: {
      slug: 'crypto-baby-xor',
      title: 'Crypto Baby - Repeating XOR',
      category: 'Crypto',
      difficulty: 'Medium',
      description: '已知密文来自重复密钥 XOR，要求恢复 key 与明文。',
      analysis: '可以利用 flag 格式已知明文攻击，先推出部分 key，再按周期还原完整 key。',
      payload: 'known_plain = b"flag{"',
      exp: `cipher = bytes.fromhex('2b0f0a...')\nknown = b'flag{'\nkey = bytes([c ^ p for c, p in zip(cipher, known)])\nprint(key)`,
      summary: '重复密钥 XOR 在已知明文场景下非常脆弱，key 周期越短越容易恢复。',
      tagsJson: stringifyTags(['xor', 'crypto', 'known-plaintext']),
      published: true
    }
  })

  await prisma.project.upsert({
    where: { slug: 'sakura-waf-lab' },
    update: {},
    create: {
      slug: 'sakura-waf-lab',
      name: 'Sakura WAF Lab',
      description: '一个用于学习 XSS、SQLi、SSRF 基础防护策略的柔和风安全实验台。',
      techStack: 'Next.js, Prisma, Docker, Tailwind CSS',
      githubUrl: 'https://github.com/yourname/sakura-waf-lab',
      demoUrl: 'https://example.com',
      tagsJson: stringifyTags(['CTF工具', 'Web', '自动化']),
      featured: true
    }
  })

  await prisma.project.upsert({
    where: { slug: 'payload-palette' },
    update: {},
    create: {
      slug: 'payload-palette',
      name: 'Payload Palette',
      description: '把常见测试 payload 做成可搜索、可标注、可导出的安全研究小工具。',
      techStack: 'TypeScript, Zustand, MDX, SQLite',
      githubUrl: 'https://github.com/yourname/payload-palette',
      demoUrl: 'https://example.com/payload-palette',
      tagsJson: stringifyTags(['渗透', '自动化', 'CTF工具']),
      featured: true
    }
  })

  const friends = [
    {
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Moon',
      name: 'Moonlit Lab',
      description: '记录逆向、取证和二进制小实验的月光实验室。',
      link: 'https://moonlit.example.com',
      tagsJson: stringifyTags(['reverse', 'forensics'])
    },
    {
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Berry',
      name: 'BerrySec',
      description: '偏 Web 安全与自动化工具开发的可爱小站。',
      link: 'https://berry.example.com',
      tagsJson: stringifyTags(['web', 'tooling'])
    },
    {
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Star',
      name: 'Starry CTF',
      description: '一起刷题、复盘和把知识点变成星星的人。',
      link: 'https://starry.example.com',
      tagsJson: stringifyTags(['ctf', 'writeup'])
    }
  ]

  for (const friend of friends) {
    await prisma.friend.upsert({
      where: { link: friend.link },
      update: friend,
      create: friend
    })
  }

  console.log('Seed done. Login with admin@sakura.dev / Sakura@123456')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
