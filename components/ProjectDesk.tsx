'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { archiveActionLabels } from '@/components/ArchiveObjectLanguage';
import type { ProjectEntry } from '@/components/ProjectTrialIndex';

type ProjectDeskGroup = {
  id: 'product' | 'research' | 'systems';
  label: string;
  projects: readonly ProjectEntry[];
};

type ProjectDeskProps = {
  groups: readonly ProjectDeskGroup[];
};

type CardPosition = { x: number; y: number };
type PointerSession = {
  slug: string;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

type ArtifactLayout = {
  left: number;
  top: number;
  rotation: number;
  scale?: number;
};

type DeskStyle = CSSProperties & {
  '--desk-left': string;
  '--desk-top': string;
  '--desk-x': string;
  '--desk-y': string;
  '--desk-rotate': string;
  '--desk-scale': number;
};

type ProjectAction = {
  href: string;
  label: string;
  kind: 'primary' | 'secondary';
};

type CarrierId =
  | 'booklet'
  | 'dossier'
  | 'invitation'
  | 'ticket'
  | 'clipboard'
  | 'research-sheet'
  | 'technical-sheet'
  | 'trace-receipt'
  | 'terminal-slip'
  | 'patch-slip'
  | 'diff-sheet'
  | 'data-card';

type Carrier = {
  id: CarrierId;
  asset: string;
  label: string;
  source: string;
  dark?: boolean;
};

const CARRIERS: Record<CarrierId, Carrier> = {
  booklet: {
    id: 'booklet',
    asset: '/work/physical/CS-01-product-booklet.png',
    label: '产品册',
    source: 'CS-01 Product Booklet'
  },
  dossier: {
    id: 'dossier',
    asset: '/work/physical/folder.png',
    label: '项目卷宗',
    source: 'Work Dossier',
    dark: true
  },
  invitation: {
    id: 'invitation',
    asset: '/work/physical/FN-03-folded-letter.png',
    label: '邀请函',
    source: 'FN-03 Folded Letter'
  },
  ticket: {
    id: 'ticket',
    asset: '/work/physical/DD-03-patch-slip.png',
    label: '体验票券',
    source: 'DD-03 Patch Slip'
  },
  clipboard: {
    id: 'clipboard',
    asset: '/work/physical/01-experiment-record-clipboard.png',
    label: '实验夹板',
    source: '01 Experiment Record Clipboard',
    dark: true
  },
  'research-sheet': {
    id: 'research-sheet',
    asset: '/work/physical/02-punched-lab-paper.png',
    label: '研究单',
    source: '02 Punched Lab Paper'
  },
  'technical-sheet': {
    id: 'technical-sheet',
    asset: '/work/physical/03-coordinate-paper.png',
    label: '技术图纸',
    source: '03 Coordinate Paper'
  },
  'trace-receipt': {
    id: 'trace-receipt',
    asset: '/work/physical/04-black-trace-ticket-shell.png',
    label: '追踪回执',
    source: '04 Black Trace Ticket Shell',
    dark: true
  },
  'terminal-slip': {
    id: 'terminal-slip',
    asset: '/work/physical/DD-01-terminal-slip.png',
    label: '终端记录',
    source: 'DD-01 Terminal Slip',
    dark: true
  },
  'patch-slip': {
    id: 'patch-slip',
    asset: '/work/physical/DD-03-patch-slip.png',
    label: '补丁记录',
    source: 'DD-03 Patch Slip'
  },
  'diff-sheet': {
    id: 'diff-sheet',
    asset: '/work/physical/DD-04-git-diff-paper.png',
    label: '变更记录',
    source: 'DD-04 Git Diff Paper'
  },
  'data-card': {
    id: 'data-card',
    asset: '/work/physical/DD-07-data-card.png',
    label: '系统资料卡',
    source: 'DD-07 Data Card'
  }
};

/* The mapping is curatorial: every project gets one carrier that matches its actual nature. */
const PROJECT_CARRIERS: Record<string, CarrierId> = {
  remindercat: 'booklet',
  'kai-cloudpay-mobile': 'data-card',
  'kai-admin-console': 'dossier',
  'kai-creator-voting': 'invitation',
  'kai-commerce-studio': 'booklet',
  'kai-play': 'ticket',
  'compute-quote-terminal': 'terminal-slip',
  'compute-intelligence': 'technical-sheet',
  'kai-market-lab': 'clipboard',
  budgetagent: 'trace-receipt',
  'enterprise-agentic-rag': 'dossier',
  'vlm-data-selection': 'research-sheet',
  'thesis-prestudy': 'research-sheet',
  'ruleforge-sast': 'patch-slip',
  miniclaudecode: 'terminal-slip',
  'mini-runtime-agent': 'trace-receipt',
  'ctf-agent': 'ticket',
  'okr-agent-platform': 'patch-slip',
  'smartcs-rag': 'data-card',
  'chloe-notebook': 'booklet',
  'xiaoyue-ai-portfolio': 'invitation',
  'all-in-rag': 'diff-sheet',
  zod: 'data-card'
};

const SPOTLIGHT_PROJECTS = new Set([
  'kai-commerce-studio',
  'compute-quote-terminal',
  'compute-intelligence',
  'vlm-data-selection',
  'kai-play'
]);

/* An editorial table composition, not generated rows or an equal card grid. */
const ARTIFACT_LAYOUT: Record<string, ArtifactLayout> = {
  'kai-commerce-studio': { left: 10, top: 13, rotation: -2.4, scale: 1.18 },
  'compute-quote-terminal': { left: 30, top: 14, rotation: 1.5, scale: 1.16 },
  'compute-intelligence': { left: 50, top: 13, rotation: -1.6, scale: 1.16 },
  'vlm-data-selection': { left: 70, top: 15, rotation: 2.1, scale: 1.14 },
  'kai-play': { left: 89, top: 14, rotation: -2.2, scale: 1.06 },
  remindercat: { left: 11, top: 35, rotation: 3.3, scale: .78 },
  'kai-cloudpay-mobile': { left: 30, top: 35, rotation: -2.4, scale: .88 },
  'kai-creator-voting': { left: 51, top: 36, rotation: 1.8, scale: .9 },
  'kai-market-lab': { left: 71, top: 34, rotation: -2.8, scale: .88 },
  'kai-admin-console': { left: 89, top: 36, rotation: 2.1, scale: .92 },
  'enterprise-agentic-rag': { left: 13, top: 56, rotation: -1.6, scale: 1.04 },
  budgetagent: { left: 32, top: 55, rotation: -4.2, scale: .88 },
  'thesis-prestudy': { left: 49, top: 57, rotation: -1.8, scale: .87 },
  'ruleforge-sast': { left: 68, top: 55, rotation: 3.2, scale: 1 },
  miniclaudecode: { left: 87, top: 56, rotation: -2.5, scale: .98 },
  'mini-runtime-agent': { left: 12, top: 76, rotation: 2.7, scale: .84 },
  'ctf-agent': { left: 30, top: 75, rotation: -3.1, scale: .86 },
  'okr-agent-platform': { left: 49, top: 76, rotation: 2.4, scale: .91 },
  'smartcs-rag': { left: 69, top: 76, rotation: -1.8, scale: .9 },
  'chloe-notebook': { left: 88, top: 75, rotation: 3.4, scale: .82 },
  'xiaoyue-ai-portfolio': { left: 20, top: 94, rotation: -2.8, scale: .8 },
  'all-in-rag': { left: 49, top: 93, rotation: 1.8, scale: .84 },
  zod: { left: 79, top: 94, rotation: -2.2, scale: .82 }
};

const EVIDENCE_LABELS: Record<ProjectEntry['evidenceState'], string> = {
  VERIFIED: '已核验',
  'REPOSITORY REPORTED': '仓库记录',
  PROTOTYPE: '原型',
  WIP: '进行中'
};

function isExternalUrl(url: string) {
  return /^(?:https?:)?\/\//.test(url);
}

function linkProps(url: string) {
  return isExternalUrl(url)
    ? { target: '_blank' as const, rel: 'noreferrer' }
    : {};
}

function addAction(actions: ProjectAction[], href: string | undefined, label: string, kind: ProjectAction['kind']) {
  if (href && !actions.some((action) => action.href === href)) {
    actions.push({ href, label, kind });
  }
}

function primaryUrl(project: ProjectEntry) {
  return project.trialUrl
    ?? project.caseUrl
    ?? project.demoUrl
    ?? project.guideUrl
    ?? project.evidenceUrl
    ?? project.repoUrl;
}

function projectActions(project: ProjectEntry) {
  const actions: ProjectAction[] = [];
  const primary = primaryUrl(project);

  addAction(actions, primary, archiveActionLabels[project.actionKind], 'primary');
  addAction(actions, project.trialUrl, '站内入口', 'secondary');
  addAction(actions, project.demoUrl, project.availability === 'VIDEO' ? '真实演示' : '公开页面', 'secondary');
  addAction(actions, project.caseUrl, '完整档案', 'secondary');
  addAction(actions, project.guideUrl, project.availability === 'LOCAL' ? '运行说明' : '使用说明', 'secondary');
  addAction(actions, project.evidenceUrl, '证据记录', 'secondary');
  addAction(actions, project.repoUrl, '源码与材料', 'secondary');

  return actions;
}

function availabilityLabel(project: ProjectEntry) {
  const labels: Record<ProjectEntry['availability'], string> = {
    LIVE: '在线页面',
    VIDEO: '真实演示',
    LOCAL: '本地运行',
    SOURCE: '技术材料',
    FORK: '学习记录',
    DEMO: '站内体验',
    RESEARCH: '研究材料'
  };

  return labels[project.availability];
}

function fallbackCarrier(project: ProjectEntry): CarrierId {
  const byObjectKind: Record<ProjectEntry['objectKind'], CarrierId> = {
    booklet: 'booklet',
    dossier: 'dossier',
    letter: 'invitation',
    ticket: 'ticket',
    newspaper: 'clipboard',
    'lab-sheet': 'technical-sheet',
    receipt: 'trace-receipt',
    blueprint: 'data-card',
    polaroid: 'data-card',
    paper: 'research-sheet',
    'sticky-note': 'patch-slip'
  };

  return byObjectKind[project.objectKind];
}

function carrierFor(project: ProjectEntry) {
  return CARRIERS[PROJECT_CARRIERS[project.slug] ?? fallbackCarrier(project)];
}

function ProjectArtifactFace({ project, carrier, spotlight }: { project: ProjectEntry; carrier: Carrier; spotlight: boolean }) {
  return (
    <>
      <img
        className="project-artifact__shell"
        src={carrier.asset}
        alt=""
        draggable={false}
        decoding="async"
      />
      {project.slug === 'enterprise-agentic-rag' && (
        <img
          className="project-artifact__clip"
          src="/work/physical/binder-clip-brass.png"
          alt=""
          draggable={false}
          decoding="async"
        />
      )}
      <span className="project-artifact__face">
        <span className="project-artifact__overline">{spotlight ? '本期重点 · ' : ''}{project.folio} · {carrier.label}</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__name">{project.name}</span>
        <span className="project-artifact__tags" aria-hidden="true">
          {project.tags.slice(0, carrier.id === 'trace-receipt' || carrier.id === 'terminal-slip' ? 3 : 2).map((tag) => (
            <i key={tag}>{tag}</i>
          ))}
        </span>
        <span className="project-artifact__open">{archiveActionLabels[project.actionKind]} <b aria-hidden="true">→</b></span>
      </span>
      <span className="project-artifact__reveal" aria-hidden="true">
        <span>{EVIDENCE_LABELS[project.evidenceState]}</span>
        <span>{availabilityLabel(project)}</span>
      </span>
    </>
  );
}

export default function ProjectDesk({ groups }: ProjectDeskProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerSession | null>(null);
  const suppressClickRef = useRef<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [positions, setPositions] = useState<Record<string, CardPosition>>({});
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const nextZRef = useRef(80);

  const flatProjects = useMemo(
    () => groups.flatMap((group) => group.projects.map((project) => ({ project, group }))),
    [groups]
  );
  const projectIndex = useMemo(
    () => new Map(flatProjects.map(({ project }, index) => [project.slug, index])),
    [flatProjects]
  );
  const selectedProject = flatProjects.find(({ project }) => project.slug === selectedSlug)?.project ?? null;
  const selectedCarrier = selectedProject ? carrierFor(selectedProject) : null;
  const selectedActions = selectedProject ? projectActions(selectedProject) : [];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && selectedSlug) {
        setSelectedSlug(null);
        window.requestAnimationFrame(() => cardRefs.current.get(selectedSlug)?.focus());
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSlug]);

  useEffect(() => {
    if (!selectedSlug) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [selectedSlug]);

  function bringToFront(slug: string) {
    nextZRef.current += 1;
    setZIndexes((current) => ({ ...current, [slug]: nextZRef.current }));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>, slug: string) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (window.matchMedia('(max-width: 760px)').matches) {
      bringToFront(slug);
      return;
    }

    const origin = positions[slug] ?? { x: 0, y: 0 };
    pointerRef.current = {
      slug,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      moved: false
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    bringToFront(slug);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>, slug: string) {
    const session = pointerRef.current;
    if (!session || session.slug !== slug || session.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;
    if (!session.moved && Math.hypot(deltaX, deltaY) < 8) return;

    session.moved = true;
    suppressClickRef.current = slug;
    setDraggingSlug(slug);

    const stageRect = stageRef.current?.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();
    let x = session.originX + deltaX;
    let y = session.originY + deltaY;

    if (stageRect) {
      const previous = positions[slug] ?? { x: 0, y: 0 };
      const nextLeft = cardRect.left + (x - previous.x);
      const nextTop = cardRect.top + (y - previous.y);
      const margin = 36;
      if (nextLeft + cardRect.width < stageRect.left + margin) x += stageRect.left + margin - (nextLeft + cardRect.width);
      if (nextLeft > stageRect.right - margin) x -= nextLeft - (stageRect.right - margin);
      if (nextTop + cardRect.height < stageRect.top + margin) y += stageRect.top + margin - (nextTop + cardRect.height);
      if (nextTop > stageRect.bottom - margin) y -= nextTop - (stageRect.bottom - margin);
    }

    setPositions((current) => ({ ...current, [slug]: { x, y } }));
  }

  function finishPointer(event: ReactPointerEvent<HTMLButtonElement>, slug: string) {
    const session = pointerRef.current;
    if (!session || session.slug !== slug || session.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (session.moved) {
      window.setTimeout(() => {
        if (suppressClickRef.current === slug) suppressClickRef.current = null;
      }, 0);
    }
    pointerRef.current = null;
    setDraggingSlug(null);
  }

  function openProject(slug: string) {
    if (suppressClickRef.current === slug) {
      suppressClickRef.current = null;
      return;
    }
    bringToFront(slug);
    setSelectedSlug(slug);
  }

  function closeProject() {
    if (!selectedProject) return;
    const slug = selectedProject.slug;
    setSelectedSlug(null);
    window.requestAnimationFrame(() => cardRefs.current.get(slug)?.focus());
  }

  function resetDesk() {
    setPositions({});
    setZIndexes({});
    setSelectedSlug(null);
    nextZRef.current = 80;
  }

  return (
    <section className="project-desk" id="project-trials" aria-labelledby="project-desk-title">
      <header className="project-desk__header">
        <div>
          <p className="project-desk__eyebrow">W.01—W.20 / F.01—F.03 · 物理作品收藏</p>
          <h2 id="project-desk-title" className="project-desk__title">作品收藏</h2>
        </div>
        <details className="project-desk__menu">
          <summary aria-label="打开收藏桌选项">···</summary>
          <div>
            <button type="button" onClick={resetDesk}>恢复物件位置</button>
          </div>
        </details>
      </header>

      <div className="project-desk__stage" ref={stageRef}>
        <div className="project-desk__surface" aria-hidden="true" />
        <div className="project-desk__collection">
          {groups.map((group, groupIndex) => (
            <section className="project-desk__group" data-group={group.id} key={group.id} aria-labelledby={`project-desk-group-${group.id}`}>
              <header className="project-desk__group-header">
                <span>0{groupIndex + 1}</span>
                <h3 id={`project-desk-group-${group.id}`}>{group.label}</h3>
              </header>
              <ol className="project-desk__objects" aria-label={`${group.label}收藏物件`}>
                {group.projects.map((project) => {
                  const flatIndex = projectIndex.get(project.slug) ?? 0;
                  const layout = ARTIFACT_LAYOUT[project.slug] ?? {
                    left: 14 + (flatIndex % 5) * 19,
                    top: 14 + Math.floor(flatIndex / 5) * 20,
                    rotation: ((flatIndex % 5) - 2) * 1.2
                  };
                  const offset = positions[project.slug] ?? { x: 0, y: 0 };
                  const style: DeskStyle = {
                    '--desk-left': `${layout.left}%`,
                    '--desk-top': `${layout.top}%`,
                    '--desk-x': `${offset.x}px`,
                    '--desk-y': `${offset.y}px`,
                    '--desk-rotate': `${layout.rotation}deg`,
                    '--desk-scale': layout.scale ?? 1,
                    zIndex: zIndexes[project.slug] ?? (10 + flatIndex)
                  };
                  const isSelected = selectedSlug === project.slug;
                  const carrier = carrierFor(project);
                  const isSpotlight = SPOTLIGHT_PROJECTS.has(project.slug);

                  return (
                    <li className="project-desk__object-slot" key={project.slug}>
                      <button
                        type="button"
                        className={`project-artifact project-artifact--${carrier.id}${carrier.dark ? ' project-artifact--dark' : ''}${isSpotlight ? ' project-artifact--spotlight' : ''}${isSelected ? ' project-artifact--selected' : ''}${draggingSlug === project.slug ? ' project-artifact--dragging' : ''}`}
                        data-availability={project.availability.toLowerCase()}
                        data-project={project.slug}
                        data-shell={carrier.source}
                        style={style}
                        aria-label={`${archiveActionLabels[project.actionKind]}：${project.titleZh}，${carrier.label}`}
                        aria-haspopup="dialog"
                        aria-pressed={isSelected}
                        ref={(node) => {
                          if (node) cardRefs.current.set(project.slug, node);
                          else cardRefs.current.delete(project.slug);
                        }}
                        onPointerDown={(event) => handlePointerDown(event, project.slug)}
                        onPointerMove={(event) => handlePointerMove(event, project.slug)}
                        onPointerUp={(event) => finishPointer(event, project.slug)}
                        onPointerCancel={(event) => finishPointer(event, project.slug)}
                        onClick={() => openProject(project.slug)}
                      >
                        <ProjectArtifactFace project={project} carrier={carrier} spotlight={isSpotlight} />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        {selectedProject && selectedCarrier && (
          <>
            <button className="project-desk__scrim" type="button" onClick={closeProject} aria-label="关闭项目档案" />
            <aside
              className="project-desk__dossier"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`project-desk-${selectedProject.slug}-title`}
            >
              <button
                type="button"
                className="project-desk__close"
                ref={closeButtonRef}
                onClick={closeProject}
                aria-label="关闭项目详情"
              >
                <span aria-hidden="true">×</span>
              </button>

              <div className="project-desk__dossier-scroll">
                <p className="project-desk__dossier-meta">
                  <span>{selectedProject.folio}</span>
                  <span>{selectedCarrier.label}</span>
                  <span>{availabilityLabel(selectedProject)}</span>
                </p>
                <h3 id={`project-desk-${selectedProject.slug}-title`}>{selectedProject.titleZh}</h3>
                <p className="project-desk__dossier-name">{selectedProject.name}</p>
                <p className="project-desk__dossier-summary">{selectedProject.summary}</p>

                <ul className="project-desk__tags-list" aria-label="技术标签">
                  {selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>

                <div className="project-desk__evidence">
                  <span>证据状态 · {EVIDENCE_LABELS[selectedProject.evidenceState]}</span>
                  <p>{selectedProject.evidenceNote}</p>
                </div>

                {selectedProject.provenance && (
                  <div className="project-desk__provenance">
                    <span>真实边界</span>
                    <p>{selectedProject.provenance}</p>
                  </div>
                )}

                {selectedActions.length > 0 ? (
                  <nav className="project-desk__actions" aria-label={`${selectedProject.name} 可用入口`}>
                    {selectedActions.map((action) => (
                      <a
                        className={`project-desk__action project-desk__action--${action.kind}`}
                        href={action.href}
                        key={`${action.label}-${action.href}`}
                        onClick={() => setSelectedSlug(null)}
                        {...linkProps(action.href)}
                      >
                        <span>{action.label}</span>
                        <span aria-hidden="true">{isExternalUrl(action.href) ? '↗' : '→'}</span>
                      </a>
                    ))}
                  </nav>
                ) : (
                  <p className="project-desk__pending">这份预研目前只在本页开放，先保留真实状态。</p>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </section>
  );
}
