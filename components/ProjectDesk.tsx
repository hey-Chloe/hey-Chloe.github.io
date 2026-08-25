'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
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

type DeskStyle = CSSProperties & {
  '--desk-left': string;
  '--desk-top': string;
  '--desk-x': string;
  '--desk-y': string;
  '--desk-rotate': string;
};

type ProjectAction = {
  href: string;
  label: string;
  kind: 'primary' | 'secondary';
};

const GROUP_ORIGINS = {
  product: { left: 18, top: 29, rotation: -2.2 },
  research: { left: 49, top: 23, rotation: 1.4 },
  systems: { left: 78, top: 27, rotation: -1.1 }
} as const;

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

function projectActions(project: ProjectEntry) {
  const actions: ProjectAction[] = [];
  const trialLabel = project.trialLabel
    ?? (project.availability === 'RESEARCH' ? '进入研究实验' : '进入站内体验');

  addAction(actions, project.trialUrl, trialLabel, 'primary');
  addAction(
    actions,
    project.demoUrl,
    project.demoLabel ?? (project.availability === 'VIDEO' ? '观看真实演示' : '打开项目'),
    actions.length === 0 ? 'primary' : 'secondary'
  );
  addAction(
    actions,
    project.caseUrl,
    project.availability === 'RESEARCH' ? '查看研究档案' : '打开项目档案',
    actions.length === 0 ? 'primary' : 'secondary'
  );
  addAction(
    actions,
    project.guideUrl,
    project.availability === 'LOCAL' ? '本地运行说明' : '阅读使用说明',
    actions.length === 0 ? 'primary' : 'secondary'
  );
  addAction(actions, project.evidenceUrl, '查看证据记录', actions.length === 0 ? 'primary' : 'secondary');
  addAction(actions, project.repoUrl, '源码与技术材料', actions.length === 0 ? 'primary' : 'secondary');

  return actions;
}

function availabilityLabel(project: ProjectEntry) {
  const labels: Record<ProjectEntry['availability'], string> = {
    LIVE: 'LIVE / 在线页面',
    VIDEO: 'VIDEO / 真实演示',
    LOCAL: 'LOCAL / 本地运行',
    SOURCE: 'SOURCE / 技术材料',
    FORK: 'FORK / 学习记录',
    DEMO: 'DEMO / 站内体验',
    RESEARCH: 'RESEARCH / 研究材料'
  };

  return labels[project.availability];
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
    () => groups.flatMap((group) => group.projects.map((project, index) => ({ project, group, index }))),
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
      const margin = 34;
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
          <p className="project-desk__eyebrow">W.01—W.19 / PROJECT DESK</p>
          <h2 id="project-desk-title">项目卡片桌</h2>
        </div>
        <div className="project-desk__utilities">
          <span className="project-desk__hint" aria-hidden="true">DRAG / OPEN</span>
          <details className="project-desk__menu">
            <summary aria-label="打开卡片桌选项">···</summary>
            <div>
              <button type="button" onClick={resetDesk}>恢复卡片位置</button>
            </div>
          </details>
        </div>
      </header>

      <div className="project-desk__stage" ref={stageRef}>
        <div className="project-desk__surface" aria-hidden="true" />
        {groups.map((group) => (
          <span className={`project-desk__group-label project-desk__group-label--${group.id}`} key={group.id}>
            {group.label} / {group.projects.length.toString().padStart(2, '0')}
          </span>
        ))}

        <ol className="project-desk__cards" aria-label="全部项目卡片">
          {flatProjects.map(({ project, group, index }, flatIndex) => {
            const origin = GROUP_ORIGINS[group.id];
            const offset = positions[project.slug] ?? { x: 0, y: 0 };
            const stackStep = group.id === 'systems' ? 18 : 23;
            const lateralStep = ((index % 3) - 1) * 6;
            const rotation = origin.rotation + ((index % 5) - 2) * .42;
            const style: DeskStyle = {
              '--desk-left': `${origin.left}%`,
              '--desk-top': `${origin.top}%`,
              '--desk-x': `${offset.x + lateralStep}px`,
              '--desk-y': `${offset.y + index * stackStep}px`,
              '--desk-rotate': `${rotation}deg`,
              zIndex: zIndexes[project.slug] ?? (10 + flatIndex)
            };
            const isSelected = selectedSlug === project.slug;

            return (
              <li className={`project-desk__card-slot project-desk__card-slot--${group.id}`} key={project.slug}>
                <button
                  type="button"
                  className={`project-desk-card${isSelected ? ' project-desk-card--selected' : ''}${draggingSlug === project.slug ? ' project-desk-card--dragging' : ''}`}
                  data-availability={project.availability.toLowerCase()}
                  data-folio={project.folio}
                  style={style}
                  aria-label={`打开 ${project.titleZh} 项目卡`}
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
                  <span className="project-desk-card__edge" aria-hidden="true" />
                  <span className="project-desk-card__meta">
                    <span>{project.folio}</span>
                    <small>{project.availability}</small>
                  </span>
                  <strong>{project.titleZh}</strong>
                  <span className="project-desk-card__name">{project.name}</span>
                  <span className="project-desk-card__open" aria-hidden="true">OPEN ↗</span>
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
                <span>{availabilityLabel(selectedProject)}</span>
              </p>
              <h3 id={`project-desk-${selectedProject.slug}-title`}>{selectedProject.titleZh}</h3>
              <p className="project-desk__dossier-name">{selectedProject.name}</p>
              <p className="project-desk__dossier-summary">{selectedProject.summary}</p>

              <ul className="project-desk__tags" aria-label="技术标签">
                {selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>

              <div className="project-desk__evidence">
                <span>{selectedProject.evidenceState}</span>
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
                <p className="project-desk__pending">公开入口仍在整理，先保留真实状态。</p>
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
