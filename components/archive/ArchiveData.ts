import type { ArchiveActionKind, ArchiveObjectKind } from './ArchiveObjectLanguage';

export type ArchiveObjectId = 'work' | 'lab' | 'notes' | 'about' | 'garden';

export type ArchiveDecoration = {
  id:
    | 'workClip'
    | 'workTab'
    | 'labPaperclip';
  assetSrc: string;
  assetWidth: number;
  assetHeight: number;
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
  assetWidth: number;
  assetHeight: number;
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
  featuredProjects?: Array<{
    index: string;
    title: string;
    status: 'PROTOTYPE' | 'REPOSITORY_REPORTED' | 'VERIFIED';
    statusLabel: string;
    evidence: string;
    actionLabel: string;
    href: string;
  }>;
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
    id: 'lab',
    folio: 'W.00',
    label: '打开三个精选项目',
    description: '查看算力报价、VLM 数据选择与公开推荐系统。',
    href: '/research/',
    kind: 'lab-sheet',
    actionKind: 'view-project',
    actionLabel: '查看精选项目',
    assetSrc: '/archive/phase-1/lab-foldout.webp',
    assetWidth: 1382,
    assetHeight: 851,
    aspectRatio: '1.48 / 1',
    x: '49%',
    y: '18%',
    w: '42%',
    rotate: '2.4deg',
    z: 15,
    title: '三个精选项目',
    subtitle: '真实界面、实验与公开演示',
    lines: ['真实结果', '公开演示', '可交互产品'],
    featuredProjects: [
      {
        index: '01',
        title: '算力动态报价终端',
        status: 'PROTOTYPE',
        statusLabel: '历史原型链接',
        evidence: '公开算力终端 · 可交互页面',
        actionLabel: '打开终端',
        href: 'https://kai-gpu.itankg64.chatgpt.site/'
      },
      {
        index: '02',
        title: 'VLM 数据选择：一个真实负结果',
        status: 'REPOSITORY_REPORTED',
        statusLabel: '仓库报告',
        evidence: '1K 同预算 · 3 个配对种子 · 未优于随机（95% CI 跨 0）',
        actionLabel: '查看负结果',
        href: '/research/vlm-data-selection/'
      },
      {
        index: '03',
        title: '端到端推荐算法实验室',
        status: 'VERIFIED',
        statusLabel: '已验证',
        evidence: '25,754 商品 · 50,653 测试用户 · 公开离线评估',
        actionLabel: '打开实验',
        href: '/research/offline-retrieval-ranking/'
      }
    ],
    decorations: [
      {
        id: 'labPaperclip',
        assetSrc: '/archive/phase-1/accessories/paperclip-silver.png',
        assetWidth: 376,
        assetHeight: 615,
        layer: 'over',
        mobile: 'hide'
      }
    ]
  },
  {
    id: 'work',
    folio: 'W.01',
    label: '查看全部作品',
    description: '完整的产品、系统、研究与真实输出索引。',
    href: '/projects/',
    kind: 'dossier',
    actionKind: 'view-project',
    actionLabel: '查看全部作品',
    assetSrc: '/archive/phase-1/work-dossier.webp',
    assetWidth: 1283,
    assetHeight: 972,
    aspectRatio: '1.32 / 1',
    x: '7%',
    y: '25%',
    w: '37%',
    rotate: '-3.2deg',
    z: 9,
    title: '全部作品',
    subtitle: '完整作品索引',
    lines: ['产品、系统与模型', '可试用作品与研究', '过程、证据与边界'],
    decorations: [
      {
        id: 'workClip',
        assetSrc: '/archive/phase-1/accessories/binder-clip-brass.png',
        assetWidth: 607,
        assetHeight: 582,
        layer: 'over',
        mobile: 'hide'
      },
      {
        id: 'workTab',
        assetSrc: '/archive/phase-1/accessories/index-tab-coral.png',
        assetWidth: 323,
        assetHeight: 239,
        layer: 'under',
        mobile: 'keep'
      }
    ]
  },
  {
    id: 'notes',
    folio: 'N.01',
    label: '翻开笔记与现场记录',
    description: '学习、实验、复现与阶段记录。',
    href: '/writing/',
    kind: 'booklet',
    actionKind: 'read-research',
    actionLabel: '阅读笔记',
    assetSrc: '/archive/phase-1/r3-field-notebook.webp',
    assetWidth: 713,
    assetHeight: 1120,
    aspectRatio: '713 / 1120',
    x: '34%',
    y: '52%',
    w: '15.5%',
    rotate: '-1.1deg',
    z: 12,
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
    href: '/archive/about/',
    kind: 'letter',
    actionKind: 'view-project',
    actionLabel: '打开来信',
    assetSrc: '/archive/phase-1/r3-folded-letter.webp',
    assetWidth: 1098,
    assetHeight: 979,
    aspectRatio: '1098 / 979',
    x: '29%',
    y: '10%',
    w: '22%',
    rotate: '-5deg',
    z: 8,
    title: '关于小悦',
    subtitle: '一封放在桌上的信',
    lines: ['Products', 'Systems', 'Models']
  },
  {
    id: 'garden',
    folio: 'G.01',
    label: '打开数字花园',
    description: '仍在发芽的知识索引。',
    href: '/archive/garden/',
    kind: 'paper',
    actionKind: 'view-project',
    actionLabel: '进入花园',
    assetSrc: '/archive/phase-1/garden-seed-packet.webp',
    assetWidth: 883,
    assetHeight: 1299,
    aspectRatio: '.72 / 1',
    x: '73%',
    y: '58%',
    w: '19%',
    rotate: '-5deg',
    z: 13,
    title: '数字花园',
    subtitle: '还在发芽的知识索引',
    lines: ['学习', '连接', '生长']
  }
];

/** Kept stable because ArchiveNav is also used by existing Notes routes. */
export const menuItems = [
  { href: '/projects/', label: 'Work' },
  { href: '/research/', label: 'Lab' },
  { href: '/writing/', label: 'Notes' },
  { href: '/archive/garden/', label: 'Garden' }
];
