import type { ArchiveActionKind, ArchiveObjectKind } from '@/components/ArchiveObjectLanguage';

export type ArchiveDeskObject = {
  id: 'work' | 'lab' | 'notes' | 'about' | 'garden';
  folio: string;
  label: string;
  zh: string;
  description: string;
  href: string;
  kind: ArchiveObjectKind;
  actionKind: ArchiveActionKind;
  x: string;
  y: string;
  w: string;
  rotate: string;
  z: number;
  title: string;
  subtitle: string;
  lines: string[];
};

/** Five world entrances, each expressed as a different found object. */
export const archiveObjects: ArchiveDeskObject[] = [
  {
    id: 'work',
    folio: 'W.01',
    label: '打开作品档案',
    zh: '作品',
    description: '做成的产品、系统与真实输出。',
    href: '/work',
    kind: 'dossier',
    actionKind: 'view-project',
    x: '8%',
    y: '21%',
    w: '37%',
    rotate: '-3.2deg',
    z: 5,
    title: 'WORK DOSSIER',
    subtitle: '做成了什么',
    lines: ['产品与系统', '真实试用与演示', '过程、证据与边界']
  },
  {
    id: 'lab',
    folio: 'L.01',
    label: '打开小悦的实验桌',
    zh: '实验',
    description: '研究中的问题、运行材料与失败记录。',
    href: '/lab',
    kind: 'newspaper',
    actionKind: 'view-experiment',
    x: '49%',
    y: '14%',
    w: '39%',
    rotate: '2.4deg',
    z: 4,
    title: 'THE XIAOYUE LAB',
    subtitle: '小悦实验报',
    lines: ['模型与系统的边界', 'Retrieval / Ranking', '失败也留在桌上']
  },
  {
    id: 'notes',
    folio: 'N.001',
    label: '翻开学习笔记',
    zh: '笔记',
    description: '学习、复现与阶段记录。',
    href: '/blog',
    kind: 'booklet',
    actionKind: 'read-research',
    x: '35%',
    y: '49%',
    w: '29%',
    rotate: '-1.1deg',
    z: 8,
    title: 'FIELD NOTES',
    subtitle: '笔记 / NOTES',
    lines: ['学习', '实验', '复现', '随手记']
  },
  {
    id: 'about',
    folio: 'A.01',
    label: '打开关于小悦',
    zh: '关于小悦',
    description: '一张关于身份、方向与成长的照片注记。',
    href: '/about',
    kind: 'polaroid',
    actionKind: 'view-project',
    x: '7%',
    y: '52%',
    w: '22%',
    rotate: '4deg',
    z: 9,
    title: 'CHLOE / 小悦',
    subtitle: 'ABOUT / 2026',
    lines: ['Products', 'Systems', 'Models']
  },
  {
    id: 'garden',
    folio: 'A.02',
    label: '打开数字花园',
    zh: '数字花园',
    description: '仍在发芽的知识索引。',
    href: '/digital-garden',
    kind: 'paper',
    actionKind: 'view-project',
    x: '72%',
    y: '58%',
    w: '20%',
    rotate: '-5deg',
    z: 10,
    title: 'GARDEN SEEDS',
    subtitle: '数字花园',
    lines: ['NETWORK', 'DATABASE', 'ALGORITHMS']
  }
];

export const menuItems = [
  { href: '/work', label: 'Work' },
  { href: '/lab', label: 'Lab' },
  { href: '/blog', label: 'Notes' },
  { href: '/digital-garden', label: 'Garden' }
];
