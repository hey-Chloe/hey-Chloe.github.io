import { absoluteUrl } from '@/lib/utils'

export const siteConfig = {
  name: 'SakuraSec',
  title: 'SakuraSec - 少女风安全研究与 CTF 花园',
  description: '一个融合少女审美、柔和科技风、安全研究、CTF Writeup、MDX 博客与作品集展示的全栈项目。',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: absoluteUrl('/og.png'),
  links: {
    github: 'https://github.com/yourname/sakura-sec',
    rss: '/rss.xml'
  },
  nav: [
    { href: '/blog', label: 'Blog' },
    { href: '/ctf', label: 'CTF' },
    { href: '/projects', label: 'Projects' },
    { href: '/friends', label: 'Friends' }
  ]
}
