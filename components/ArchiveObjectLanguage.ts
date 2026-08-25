/**
 * Shared vocabulary for Chloe's Archive worlds.
 *
 * This is intentionally an object language rather than a component library:
 * each world is free to render the same kind differently, while the content
 * and evidence state still determine the material and the public next step.
 */
export const archiveObjectKinds = [
  'paper',
  'newspaper',
  'dossier',
  'polaroid',
  'ticket',
  'lab-sheet',
  'receipt',
  'letter',
  'sticky-note',
  'blueprint',
  'booklet'
] as const;

export type ArchiveObjectKind = (typeof archiveObjectKinds)[number];

export const archiveObjectKindNames: Record<ArchiveObjectKind, string> = {
  paper: '纸张',
  newspaper: '报纸',
  dossier: '档案袋',
  polaroid: '照片',
  ticket: '票根',
  'lab-sheet': '实验记录',
  receipt: '运行回执',
  letter: '信件',
  'sticky-note': '便签',
  blueprint: '系统蓝图',
  booklet: '项目册'
};

export const archiveActionKinds = [
  'try',
  'view-project',
  'view-experiment',
  'read-research',
  'view-prototype',
  'watch-demo',
  'run-locally'
] as const;

export type ArchiveActionKind = (typeof archiveActionKinds)[number];

export const archiveActionLabels: Record<ArchiveActionKind, string> = {
  try: '直接体验',
  'view-project': '查看项目',
  'view-experiment': '查看实验',
  'read-research': '阅读研究',
  'view-prototype': '原型记录',
  'watch-demo': '查看演示',
  'run-locally': '本地运行'
};
