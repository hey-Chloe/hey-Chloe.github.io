'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  archiveActionLabels,
  archiveObjectKindNames
} from '@/components/ArchiveObjectLanguage';
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

/* A composed desktop, not three generated stacks. Positions preserve visible edges. */
const ARTIFACT_LAYOUT: Record<string, ArtifactLayout> = {
  'kai-commerce-studio': { left: 13, top: 17, rotation: -3.2, scale: 1.04 },
  remindercat: { left: 32, top: 14, rotation: 3.6, scale: .94 },
  'kai-creator-voting': { left: 47, top: 18, rotation: -1.2 },
  'kai-play': { left: 65, top: 13, rotation: 2.4, scale: .96 },
  'kai-cloudpay-mobile': { left: 82, top: 17, rotation: 2.8 },
  zod: { left: 94, top: 24, rotation: -3.8, scale: .84 },
  'kai-admin-console': { left: 15, top: 40, rotation: 1.1 },
  'compute-intelligence': { left: 34, top: 40, rotation: -2.2 },
  'kai-market-lab': { left: 55, top: 39, rotation: 1.4 },
  'enterprise-agentic-rag': { left: 77, top: 41, rotation: -1.6 },
  'xiaoyue-ai-portfolio': { left: 94, top: 46, rotation: 4.1, scale: .84 },
  budgetagent: { left: 11, top: 66, rotation: -2.9, scale: .95 },
  'vlm-data-selection': { left: 28, top: 65, rotation: 1.8 },
  'thesis-prestudy': { left: 45, top: 65, rotation: -1.1, scale: .96 },
  'ruleforge-sast': { left: 62, top: 66, rotation: 3 },
  miniclaudecode: { left: 82, top: 65, rotation: -1.9 },
  'all-in-rag': { left: 95, top: 70, rotation: 2.7, scale: .82 },
  'mini-runtime-agent': { left: 13, top: 88, rotation: 2.6, scale: .9 },
  'ctf-agent': { left: 30, top: 87, rotation: -2.1, scale: .94 },
  'okr-agent-platform': { left: 47, top: 87, rotation: 2.8, scale: .92 },
  'smartcs-rag': { left: 64, top: 87, rotation: -1.4, scale: .9 },
  'chloe-notebook': { left: 83, top: 87, rotation: 2.2, scale: .9 }
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

function ProjectArtifactFace({ project }: { project: ProjectEntry }) {
  const action = archiveActionLabels[project.actionKind];
  const tags = project.tags.slice(0, 3);

  if (project.objectKind === 'booklet') {
    return (
      <>
        <span className="project-artifact__spine" aria-hidden="true" />
        <span className="project-artifact__overline">{project.folio} · COLLECTION</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__edition">{project.name}</span>
        <span className="project-artifact__plates" aria-hidden="true"><i /><i /><i /></span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'newspaper') {
    return (
      <>
        <span className="project-artifact__masthead">THE XIAOYUE LAB</span>
        <span className="project-artifact__dateline">{project.folio} · TRAIN / VALIDATION</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__deck">NO PNL · 不发送订单</span>
        <span className="project-artifact__columns" aria-hidden="true"><i /><i /><i /></span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'dossier') {
    return (
      <>
        <span className="project-artifact__folder-tab">{project.folio}</span>
        <span className="project-artifact__overline">TECHNICAL DOSSIER</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__fields">
          {tags.map((tag, index) => <i key={tag}><small>0{index + 1}</small>{tag}</i>)}
        </span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'polaroid') {
    const isMobile = project.slug === 'kai-cloudpay-mobile' || project.slug === 'zod';
    return (
      <>
        <span className={`project-artifact__photo${isMobile ? ' project-artifact__photo--device' : ''}`} aria-hidden="true">
          {isMobile ? <i className="project-artifact__device"><b /><b /><b /></i> : <i className="project-artifact__play">▶</i>}
          <small>{isMobile ? 'BROWSER SANDBOX' : project.availability === 'VIDEO' ? 'VIDEO RECORD' : 'ITERATION RECORD'}</small>
        </span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__scribble">{project.folio} · {action} →</span>
      </>
    );
  }

  if (project.objectKind === 'ticket') {
    return (
      <>
        <span className="project-artifact__ticket-code">{project.folio}</span>
        <span className="project-artifact__ticket-admit">{project.availability === 'LOCAL' ? 'AUTHORIZED LAB' : 'PLAY PASS'}</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__ticket-detail">{tags.join(' · ')}</span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'lab-sheet') {
    return (
      <>
        <span className="project-artifact__overline">{project.folio} / LAB SHEET</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__rule"><small>观察对象</small>{tags[0]}</span>
        <span className="project-artifact__rule"><small>方法</small>{tags.slice(1).join(' + ')}</span>
        <span className="project-artifact__graph" aria-hidden="true"><i /><i /><i /><i /><i /></span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'receipt') {
    return (
      <>
        <span className="project-artifact__receipt-head">TRACE RECEIPT · {project.folio}</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__receipt-lines">
          {tags.map((tag) => <i key={tag}><small>›</small>{tag}</i>)}
        </span>
        <span className="project-artifact__receipt-state">state: {EVIDENCE_LABELS[project.evidenceState]}</span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'letter') {
    return (
      <>
        <span className="project-artifact__letter-date">INVITATION · {project.folio}</span>
        <span className="project-artifact__letter-to">TO / CREATOR</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__letter-copy">发布活动 · 投稿 · 浏览 · 投票</span>
        <span className="project-artifact__seal" aria-hidden="true">✿</span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'sticky-note') {
    return (
      <>
        <span className="project-artifact__pin" aria-hidden="true" />
        <span className="project-artifact__overline">{project.folio} / {EVIDENCE_LABELS[project.evidenceState]}</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__note">{project.slug === 'remindercat' ? '一分钟后，回来提醒我喝水。' : '权限节点仍在占位，先把边界写清楚。'}</span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  if (project.objectKind === 'blueprint') {
    return (
      <>
        <span className="project-artifact__overline">{project.folio} / SYSTEM BLUEPRINT</span>
        <strong>{project.titleZh}</strong>
        <span className="project-artifact__nodes" aria-hidden="true">
          {tags.map((tag) => <i key={tag}>{tag}</i>)}
        </span>
        <span className="project-artifact__action">{action} →</span>
      </>
    );
  }

  return (
    <>
      <span className="project-artifact__paper-head">{project.folio} · RESEARCH PRINT</span>
      <strong>{project.titleZh}</strong>
      <span className="project-artifact__abstract"><small>摘要</small>{project.summary}</span>
      <span className="project-artifact__footnote">{project.name}</span>
      <span className="project-artifact__action">{action} →</span>
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
  const selectedProject = flatProjects.find(({ project }) => project.slug === selectedSlug)?.project ?? null;
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
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
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
      const nextLeft = cardRect.left + (x - (positions[slug]?.x ?? 0));
      const nextTop = cardRect.top + (y - (positions[slug]?.y ?? 0));
      const margin = 30;
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
          <p className="project-desk__eyebrow">W.01—W.19 / WORK = BUILD</p>
          <h2 id="project-desk-title">收藏桌</h2>
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
        <ol className="project-desk__objects" aria-label="全部项目收藏物件">
          {flatProjects.map(({ project }, flatIndex) => {
            const layout = ARTIFACT_LAYOUT[project.slug] ?? {
              left: 12 + (flatIndex % 5) * 19,
              top: 16 + Math.floor(flatIndex / 5) * 20,
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

            return (
              <li
                className={`project-desk__object-slot project-desk__object-slot--${project.objectKind}`}
                key={project.slug}
              >
                <button
                  type="button"
                  className={`project-artifact project-artifact--${project.objectKind}${isSelected ? ' project-artifact--selected' : ''}${draggingSlug === project.slug ? ' project-artifact--dragging' : ''}`}
                  data-availability={project.availability.toLowerCase()}
                  data-project={project.slug}
                  style={style}
                  aria-label={`${archiveActionLabels[project.actionKind]}：${project.titleZh}`}
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
                  <span className="project-artifact__kind">{archiveObjectKindNames[project.objectKind]}</span>
                  <ProjectArtifactFace project={project} />
                </button>
              </li>
            );
          })}
        </ol>

        {selectedProject && (
          <aside
            className="project-desk__dossier"
            role="dialog"
            aria-labelledby={`project-desk-${selectedProject.slug}-title`}
          >
            <button
              type="button"
              className="project-desk__close"
              ref={closeButtonRef}
              onClick={() => {
                setSelectedSlug(null);
                window.requestAnimationFrame(() => cardRefs.current.get(selectedProject.slug)?.focus());
              }}
              aria-label="关闭项目详情"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="project-desk__dossier-scroll">
              <p className="project-desk__dossier-meta">
                <span>{selectedProject.folio}</span>
                <span>{archiveObjectKindNames[selectedProject.objectKind]}</span>
                <span>{availabilityLabel(selectedProject)}</span>
              </p>
              <h3 id={`project-desk-${selectedProject.slug}-title`}>{selectedProject.titleZh}</h3>
              <p className="project-desk__dossier-name">{selectedProject.name}</p>
              <p className="project-desk__dossier-summary">{selectedProject.summary}</p>

              <ul className="project-desk__tags" aria-label="技术标签">
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
        )}
      </div>
    </section>
  );
}
