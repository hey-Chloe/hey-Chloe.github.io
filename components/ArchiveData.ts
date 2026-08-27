import type { ArchiveActionKind, ArchiveObjectKind } from '@/components/ArchiveObjectLanguage';

export type ArchiveObjectId = 'work' | 'lab' | 'notes' | 'about' | 'garden';

export type ArchiveDecoration = {
  id:
    | 'workClip'
    | 'workTab'
    | 'labPaperclip';
  assetSrc: string;
  layer: 'under' | 'over';
  mobile: 'keep' | 'hide';
};

export type ArchiveDeskObject = {
  id: ArchiveObjectId;
  folio: string;
  label: string;
  description: string;
  href: string;
  kind: ArchiveObjectKind;
  actionKind: ArchiveActionKind;
  actionLabel: string;
  assetSrc: string;
  aspectRatio: string;
  x: string;
  y: string;
  w: string;
  rotate: string;
  z: number;
  title: string;
  titleLines?: string[];
  subtitle: string;
  lines: string[];
  decorations?: ArchiveDecoration[];
};

/**
 * Archive Phase 1 entrances.
 *
 * The WebP files are blank physical substrates. All readable copy remains in
 * the DOM so the generated asset never becomes the source of truth for text.
 */
export const archiveObjects: ArchiveDeskObject[] = [
  {
    id: 'work',
    folio: 'W.01',
    label: '打开作品收藏',
    description: '做成的产品、系统与真实输出。',
    href: '/work',
    kind: 'dossier',
    actionKind: 'view-project',
    actionLabel: '打开作品',
    assetSrc: '/archive/phase-1/work-dossier.webp',
    aspectRatio: '1.32 / 1',
    x: '7%',
    y: '25%',
    w: '37%',
    rotate: '-3.2deg',
    z: 11,
    title: '作品收藏',
    subtitle: '我做成了什么',
    lines: ['产品与系统', '真实试用与演示', '过程、证据与边界'],
    decorations: [
      {
        id: 'workClip',
        assetSrc: '/archive/phase-1/accessories/binder-clip-brass.png',
        layer: 'over',
        mobile: 'hide'
      },
      {
        id: 'workTab',
        assetSrc: '/archive/phase-1/accessories/index-tab-coral.png',
        layer: 'under',
        mobile: 'keep'
      }
    ]
  },
  {
    id: 'lab',
    folio: 'L.01',
    label: '打开小悦的实验桌',
    description: '研究中的问题、运行材料与失败记录。',
    href: '/lab',
    kind: 'lab-sheet',
    actionKind: 'view-experiment',
    actionLabel: '查看实验',
    assetSrc: '/archive/phase-1/lab-foldout.webp',
    aspectRatio: '1.48 / 1',
    x: '49%',
    y: '18%',
    w: '42%',
    rotate: '2.4deg',
    z: 10,
    title: '小悦的实验桌',
    subtitle: '模型、系统与证据',
    lines: ['Agent 边界', 'Retrieval / Ranking', '失败也留在桌上'],
    decorations: [
      {
        id: 'labPaperclip',
        assetSrc: '/archive/phase-1/accessories/paperclip-silver.png',
        layer: 'over',
        mobile: 'hide'
      }
    ]
  },
  {
    id: 'notes',
    folio: 'N.01',
    label: '翻开笔记与现场记录',
    description: '学习、实验、复现与阶段记录。',
    href: '/blog',
    kind: 'booklet',
    actionKind: 'read-research',
    actionLabel: '阅读笔记',
    assetSrc: '/archive/phase-1/r3-field-notebook.webp',
    aspectRatio: '713 / 1120',
    x: '40%',
    y: '50%',
    w: '27%',
    rotate: '-1.1deg',
    z: 13,
    title: '笔记与现场记录',
    titleLines: ['笔记与', '现场记录'],
    subtitle: '学习 / 实验 / 复现',
    lines: ['近期笔记', '研究阅读', '早期档案'],
  },
  {
    id: 'about',
    folio: 'A.02',
    label: '打开关于小悦的来信',
    description: '关于身份、方向与成长的一封短信。',
    href: '/about',
    kind: 'letter',
    actionKind: 'view-project',
    actionLabel: '打开来信',
    assetSrc: '/archive/phase-1/r3-folded-letter.webp',
    aspectRatio: '1098 / 979',
    x: '29%',
    y: '10%',
    w: '22%',
    rotate: '-5deg',
    z: 9,
    title: '关于小悦',
    subtitle: '一封放在桌上的信',
    lines: ['Products', 'Systems', 'Models']
  },
  {
    id: 'garden',
    folio: 'G.01',
    label: '打开数字花园',
    description: '仍在发芽的知识索引。',
    href: '/digital-garden',
    kind: 'paper',
    actionKind: 'view-project',
    actionLabel: '进入花园',
    assetSrc: '/archive/phase-1/garden-seed-packet.webp',
    aspectRatio: '.72 / 1',
    x: '73%',
    y: '58%',
    w: '19%',
    rotate: '-5deg',
    z: 14,
    title: '数字花园',
    subtitle: '还在发芽的知识索引',
    lines: ['学习', '连接', '生长']
  }
];

/** Kept stable because ArchiveNav is also used by existing Notes routes. */
export const menuItems = [
  { href: '/work', label: 'Work' },
  { href: '/lab', label: 'Lab' },
  { href: '/blog', label: 'Notes' },
  { href: '/digital-garden', label: 'Garden' }
];
