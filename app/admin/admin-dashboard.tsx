'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpenText, FolderGit2, HeartHandshake, LayoutDashboard, LogOut, Plus, Save, ShieldCheck, TerminalSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { parseTags } from '@/lib/utils'

type Session = { email: string; name: string; role: 'ADMIN' | 'USER' }
type PostItem = { id: string; title: string; slug: string; excerpt: string; content: string; tagsJson: string; published: boolean }
type CtfItem = { id: string; title: string; slug: string; category: string; difficulty: string; description: string; analysis: string; payload: string; exp: string; summary: string; tagsJson: string; published: boolean }
type ProjectItem = { id: string; name: string; slug: string; description: string; techStack: string; githubUrl: string; demoUrl?: string | null; tagsJson: string; featured: boolean }
type FriendItem = { id: string; name: string; avatar: string; description: string; link: string; tagsJson: string }

type Overview = {
  posts: PostItem[]
  ctfTasks: CtfItem[]
  projects: ProjectItem[]
  friends: FriendItem[]
}

const tabs = [
  { key: 'overview', label: '总览', icon: LayoutDashboard },
  { key: 'posts', label: '博客管理', icon: BookOpenText },
  { key: 'ctf', label: 'CTF 管理', icon: TerminalSquare },
  { key: 'projects', label: '项目管理', icon: FolderGit2 },
  { key: 'friends', label: '友链管理', icon: HeartHandshake }
]

const defaultPost = { title: '', slug: '', excerpt: '', content: '# 新文章\n\n## 小节\n\n写点安全研究吧。', tags: 'security, web', published: true }
const defaultCtf = { title: '', slug: '', category: 'Web', difficulty: 'Easy', description: '', analysis: '', payload: '', exp: '', summary: '', tags: 'web, ctf', published: true }
const defaultProject = { name: '', slug: '', description: '', techStack: 'Next.js, TypeScript, Tailwind CSS', githubUrl: 'https://github.com/', demoUrl: '', tags: 'CTF工具, Web', featured: false }
const defaultFriend = { name: '', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura', description: '', link: 'https://example.com', tags: 'security, blog' }

export function AdminDashboard({ session }: { session: Session }) {
  const router = useRouter()
  const [active, setActive] = useState('overview')
  const [overview, setOverview] = useState<Overview>({ posts: [], ctfTasks: [], projects: [], friends: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [postForm, setPostForm] = useState<any>(defaultPost)
  const [ctfForm, setCtfForm] = useState<any>(defaultCtf)
  const [projectForm, setProjectForm] = useState<any>(defaultProject)
  const [friendForm, setFriendForm] = useState<any>(defaultFriend)

  async function load() {
    setLoading(true)
    const response = await fetch('/api/admin/overview')
    if (response.ok) setOverview(await response.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(
    () => [
      { label: '博客文章', value: overview.posts.length, icon: BookOpenText },
      { label: 'CTF 题目', value: overview.ctfTasks.length, icon: TerminalSquare },
      { label: '项目作品', value: overview.projects.length, icon: FolderGit2 },
      { label: '友链伙伴', value: overview.friends.length, icon: HeartHandshake }
    ],
    [overview]
  )

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  async function submitForm(event: FormEvent, resource: 'posts' | 'ctf' | 'projects' | 'friends', form: any, reset: () => void) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    const id = form.id
    const url = id ? `/api/admin/${resource}/${id}` : `/api/admin/${resource}`
    const method = id ? 'PATCH' : 'POST'
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setNotice(data?.message || '保存失败，请检查字段。')
      return
    }
    setNotice('保存成功，内容已经更新。')
    reset()
    await load()
    router.refresh()
  }

  async function remove(resource: 'posts' | 'ctf' | 'projects' | 'friends', id: string) {
    if (!confirm('确认删除吗？这个操作不可恢复。')) return
    await fetch(`/api/admin/${resource}/${id}`, { method: 'DELETE' })
    await load()
    router.refresh()
  }

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-soft backdrop-blur-2xl md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sakura-500">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-black text-[#50326f]">SakuraSec 内容管理后台</h1>
          <p className="mt-1 text-sm text-muted-foreground">当前用户：{session.name} · {session.email}</p>
        </div>
        <Button variant="secondary" onClick={logout}><LogOut className="mr-2 h-4 w-4" />退出登录</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="glass h-fit rounded-[2rem] p-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${active === tab.key ? 'bg-pastel-glow text-white shadow-glow' : 'text-lavender-600 hover:bg-white/65'}`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </aside>

        <section className="min-w-0">
          {notice && <div className="mb-5 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm font-semibold text-sakura-600 shadow-soft backdrop-blur-xl">{notice}</div>}
          {loading ? (
            <div className="glass rounded-[2rem] p-10 text-center font-semibold text-muted-foreground">正在加载后台数据...</div>
          ) : (
            <>
              {active === 'overview' && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="glass rounded-[2rem] p-6">
                      <stat.icon className="mb-5 h-8 w-8 text-sakura-500" />
                      <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-4xl font-black text-[#50326f]">{stat.value}</p>
                    </div>
                  ))}
                  <div className="glass rounded-[2rem] p-6 md:col-span-2 xl:col-span-4">
                    <h2 className="mb-3 flex items-center gap-2 text-2xl font-black text-[#50326f]"><ShieldCheck className="h-6 w-6 text-sakura-500" />权限说明</h2>
                    <p className="leading-8 text-muted-foreground">只有登录管理员可以写博客、发布 CTF 题目、编辑项目与友链。未登录用户只能阅读博客、浏览 CTF、查看作品集与友链。</p>
                  </div>
                </div>
              )}

              {active === 'posts' && (
                <Manager title="博客管理" hint="新建、编辑、删除 MDX 文章；标签用逗号分隔。">
                  <form onSubmit={(event) => submitForm(event, 'posts', postForm, () => setPostForm(defaultPost))} className="grid gap-4">
                    <Field label="标题"><Input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} /></Field>
                    <Field label="Slug"><Input value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} placeholder="留空自动生成" /></Field>
                    <Field label="摘要"><Input value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} /></Field>
                    <Field label="标签"><Input value={postForm.tags} onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })} /></Field>
                    <Field label="MDX 内容"><Textarea className="min-h-[360px] font-mono" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} /></Field>
                    <PublishToggle checked={postForm.published} onChange={(value) => setPostForm({ ...postForm, published: value })} label="发布文章" />
                    <FormActions saving={saving} editing={Boolean(postForm.id)} onReset={() => setPostForm(defaultPost)} />
                  </form>
                  <List title="已有文章">
                    {overview.posts.map((post) => (
                      <ListItem key={post.id} title={post.title} subtitle={post.slug} tags={parseTags(post.tagsJson)} onEdit={() => setPostForm({ id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, tags: parseTags(post.tagsJson).join(', '), published: post.published })} onDelete={() => remove('posts', post.id)} />
                    ))}
                  </List>
                </Manager>
              )}

              {active === 'ctf' && (
                <Manager title="CTF 管理" hint="创建题目、分类、Writeup、Payload 与 Exp。">
                  <form onSubmit={(event) => submitForm(event, 'ctf', ctfForm, () => setCtfForm(defaultCtf))} className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field label="标题"><Input value={ctfForm.title} onChange={(e) => setCtfForm({ ...ctfForm, title: e.target.value })} /></Field>
                      <Field label="分类"><select className="admin-field h-11 w-full" value={ctfForm.category} onChange={(e) => setCtfForm({ ...ctfForm, category: e.target.value })}>{['Web','Pwn','Crypto','Reverse','Misc'].map((c) => <option key={c}>{c}</option>)}</select></Field>
                      <Field label="难度"><Input value={ctfForm.difficulty} onChange={(e) => setCtfForm({ ...ctfForm, difficulty: e.target.value })} /></Field>
                    </div>
                    <Field label="Slug"><Input value={ctfForm.slug} onChange={(e) => setCtfForm({ ...ctfForm, slug: e.target.value })} placeholder="留空自动生成" /></Field>
                    <Field label="标签"><Input value={ctfForm.tags} onChange={(e) => setCtfForm({ ...ctfForm, tags: e.target.value })} /></Field>
                    <Field label="题目描述"><Textarea value={ctfForm.description} onChange={(e) => setCtfForm({ ...ctfForm, description: e.target.value })} /></Field>
                    <Field label="思路分析"><Textarea value={ctfForm.analysis} onChange={(e) => setCtfForm({ ...ctfForm, analysis: e.target.value })} /></Field>
                    <Field label="Payload"><Textarea className="font-mono" value={ctfForm.payload} onChange={(e) => setCtfForm({ ...ctfForm, payload: e.target.value })} /></Field>
                    <Field label="Exp"><Textarea className="font-mono" value={ctfForm.exp} onChange={(e) => setCtfForm({ ...ctfForm, exp: e.target.value })} /></Field>
                    <Field label="知识点总结"><Textarea value={ctfForm.summary} onChange={(e) => setCtfForm({ ...ctfForm, summary: e.target.value })} /></Field>
                    <PublishToggle checked={ctfForm.published} onChange={(value) => setCtfForm({ ...ctfForm, published: value })} label="发布题目" />
                    <FormActions saving={saving} editing={Boolean(ctfForm.id)} onReset={() => setCtfForm(defaultCtf)} />
                  </form>
                  <List title="已有题目">
                    {overview.ctfTasks.map((task) => (
                      <ListItem key={task.id} title={task.title} subtitle={`${task.category} · ${task.slug}`} tags={parseTags(task.tagsJson)} onEdit={() => setCtfForm({ id: task.id, title: task.title, slug: task.slug, category: task.category, difficulty: task.difficulty, description: task.description, analysis: task.analysis, payload: task.payload, exp: task.exp, summary: task.summary, tags: parseTags(task.tagsJson).join(', '), published: task.published })} onDelete={() => remove('ctf', task.id)} />
                    ))}
                  </List>
                </Manager>
              )}

              {active === 'projects' && (
                <Manager title="项目管理" hint="添加作品、GitHub 链接、Demo 链接与项目介绍。">
                  <form onSubmit={(event) => submitForm(event, 'projects', projectForm, () => setProjectForm(defaultProject))} className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2"><Field label="项目名称"><Input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} /></Field><Field label="Slug"><Input value={projectForm.slug} onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })} /></Field></div>
                    <Field label="项目介绍"><Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} /></Field>
                    <Field label="技术栈"><Input value={projectForm.techStack} onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })} /></Field>
                    <div className="grid gap-4 md:grid-cols-2"><Field label="GitHub"><Input value={projectForm.githubUrl} onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })} /></Field><Field label="Demo"><Input value={projectForm.demoUrl} onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })} /></Field></div>
                    <Field label="标签"><Input value={projectForm.tags} onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })} /></Field>
                    <PublishToggle checked={projectForm.featured} onChange={(value) => setProjectForm({ ...projectForm, featured: value })} label="设为精选" />
                    <FormActions saving={saving} editing={Boolean(projectForm.id)} onReset={() => setProjectForm(defaultProject)} />
                  </form>
                  <List title="已有项目">
                    {overview.projects.map((project) => <ListItem key={project.id} title={project.name} subtitle={project.slug} tags={parseTags(project.tagsJson)} onEdit={() => setProjectForm({ id: project.id, name: project.name, slug: project.slug, description: project.description, techStack: project.techStack, githubUrl: project.githubUrl, demoUrl: project.demoUrl || '', tags: parseTags(project.tagsJson).join(', '), featured: project.featured })} onDelete={() => remove('projects', project.id)} />)}
                  </List>
                </Manager>
              )}

              {active === 'friends' && (
                <Manager title="友链管理" hint="卡片式友链，包含 avatar、name、description、link。">
                  <form onSubmit={(event) => submitForm(event, 'friends', friendForm, () => setFriendForm(defaultFriend))} className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2"><Field label="名称"><Input value={friendForm.name} onChange={(e) => setFriendForm({ ...friendForm, name: e.target.value })} /></Field><Field label="链接"><Input value={friendForm.link} onChange={(e) => setFriendForm({ ...friendForm, link: e.target.value })} /></Field></div>
                    <Field label="Avatar"><Input value={friendForm.avatar} onChange={(e) => setFriendForm({ ...friendForm, avatar: e.target.value })} /></Field>
                    <Field label="描述"><Textarea value={friendForm.description} onChange={(e) => setFriendForm({ ...friendForm, description: e.target.value })} /></Field>
                    <Field label="标签"><Input value={friendForm.tags} onChange={(e) => setFriendForm({ ...friendForm, tags: e.target.value })} /></Field>
                    <FormActions saving={saving} editing={Boolean(friendForm.id)} onReset={() => setFriendForm(defaultFriend)} />
                  </form>
                  <List title="已有友链">
                    {overview.friends.map((friend) => <ListItem key={friend.id} title={friend.name} subtitle={friend.link} tags={parseTags(friend.tagsJson)} onEdit={() => setFriendForm({ id: friend.id, name: friend.name, avatar: friend.avatar, description: friend.description, link: friend.link, tags: parseTags(friend.tagsJson).join(', ') })} onDelete={() => remove('friends', friend.id)} />)}
                  </List>
                </Manager>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function Manager({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-[2rem] p-5 md:p-7">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#50326f]">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{hint}</p>
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2"><Label>{label}</Label>{children}</label>
}

function PublishToggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-white/50 p-4 text-sm font-semibold text-lavender-600">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-pink-500" />
      {label}
    </label>
  )
}

function FormActions({ saving, editing, onReset }: { saving: boolean; editing: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button disabled={saving} type="submit"><Save className="mr-2 h-4 w-4" />{saving ? '保存中...' : editing ? '保存修改' : '新建'}</Button>
      <Button type="button" variant="secondary" onClick={onReset}><Plus className="mr-2 h-4 w-4" />清空表单</Button>
    </div>
  )
}

function List({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-3"><h3 className="text-lg font-black text-[#50326f]">{title}</h3>{children}</div>
}

function ListItem({ title, subtitle, tags, onEdit, onDelete }: { title: string; subtitle: string; tags: string[]; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm backdrop-blur-xl">
      <h4 className="font-black text-[#50326f]">{title}</h4>
      <p className="mt-1 break-all text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" type="button" variant="secondary" onClick={onEdit}>编辑</Button>
        <Button size="sm" type="button" variant="destructive" onClick={onDelete}><Trash2 className="mr-2 h-4 w-4" />删除</Button>
      </div>
    </div>
  )
}
