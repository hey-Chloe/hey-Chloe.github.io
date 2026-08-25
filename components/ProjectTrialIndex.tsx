import type { EvidenceState } from '@/components/EvidenceBadge';

export type ProjectAvailability = 'LIVE' | 'VIDEO' | 'LOCAL' | 'SOURCE' | 'FORK' | 'DEMO' | 'RESEARCH';

export type ProjectEntry = {
  slug: string;
  folio: string;
  name: string;
  titleZh: string;
  category: string;
  summary: string;
  tags: readonly string[];
  evidenceState: EvidenceState;
  evidenceNote: string;
  evidenceUrl?: string;
  availability: ProjectAvailability;
  repoUrl?: string;
  trialUrl?: string;
  trialLabel?: string;
  demoUrl?: string;
  demoLabel?: string;
  guideUrl?: string;
  caseUrl?: string;
  provenance?: string;
  featured?: boolean;
};

export type ProjectTrialIndexProps = {
  projects: readonly ProjectEntry[];
  heading?: string;
  intro?: string;
};

type ProjectAction = {
  href: string;
  label: string;
  kind: 'primary' | 'secondary';
};

type AvailabilityView = {
  status: string;
  cardHref?: string;
  cardLabel: string;
  actions: ProjectAction[];
};

function isExternalUrl(url: string) {
  return /^(?:https?:)?\/\//.test(url);
}

function linkProps(url: string) {
  return isExternalUrl(url)
    ? { target: '_blank' as const, rel: 'noreferrer' }
    : {};
}

function pushUniqueAction(actions: ProjectAction[], action: ProjectAction | null) {
  if (action && !actions.some((candidate) => candidate.href === action.href)) {
    actions.push(action);
  }
}

function entryLabels(project: ProjectEntry) {
  const labels: Record<ProjectAvailability, { caseLabel: string; demoLabel: string }> = {
    LIVE: { caseLabel: '打开项目档案', demoLabel: '在线试用' },
    VIDEO: { caseLabel: '打开项目档案', demoLabel: '观看演示' },
    LOCAL: { caseLabel: '打开项目档案', demoLabel: '查看演示' },
    SOURCE: { caseLabel: '打开项目档案', demoLabel: '查看演示' },
    FORK: { caseLabel: '打开学习档案', demoLabel: '打开学习版本' },
    DEMO: { caseLabel: '打开项目档案', demoLabel: '进入站内体验' },
    RESEARCH: { caseLabel: '查看研究档案', demoLabel: '查看研究演示' }
  };

  return {
    trialLabel: project.trialLabel ?? (project.availability === 'RESEARCH' ? '进入研究实验' : '进入站内体验'),
    ...labels[project.availability]
  };
}

function availabilityView(project: ProjectEntry): AvailabilityView {
  const labels = entryLabels(project);
  const primaryEntry = project.trialUrl
    ? { href: project.trialUrl, label: labels.trialLabel }
    : project.caseUrl
      ? { href: project.caseUrl, label: labels.caseLabel }
      : project.demoUrl
        ? { href: project.demoUrl, label: project.demoLabel ?? labels.demoLabel }
        : null;
  const actions: ProjectAction[] = [];

  if (primaryEntry) {
    pushUniqueAction(actions, { ...primaryEntry, kind: 'primary' });
  }

  if (project.caseUrl) {
    pushUniqueAction(actions, {
      href: project.caseUrl,
      label: labels.caseLabel,
      kind: primaryEntry ? 'secondary' : 'primary'
    });
  }

  if (project.demoUrl) {
    pushUniqueAction(actions, {
      href: project.demoUrl,
      label: project.demoLabel ?? labels.demoLabel,
      kind: primaryEntry ? 'secondary' : 'primary'
    });
  }

  const guideLabel = project.availability === 'LIVE'
    ? '使用说明'
    : project.availability === 'LOCAL' || project.availability === 'VIDEO'
      ? '本地运行'
      : project.availability === 'FORK'
        ? 'Fork 后运行'
        : '阅读说明';

  if (project.guideUrl) {
    pushUniqueAction(actions, {
      href: project.guideUrl,
      label: guideLabel,
      kind: primaryEntry ? 'secondary' : 'primary'
    });
  }

  if (project.repoUrl) {
    pushUniqueAction(actions, {
      href: project.repoUrl,
      label: '技术材料',
      kind: 'secondary'
    });
  }

  const fallbackEntry = primaryEntry
    ?? (project.guideUrl ? { href: project.guideUrl, label: guideLabel } : null)
    ?? (project.repoUrl ? { href: project.repoUrl, label: '技术材料' } : null);
  const status: Record<ProjectAvailability, string> = {
    LIVE: primaryEntry ? 'LIVE / 在线页面' : 'LIVE / 入口待补',
    VIDEO: 'VIDEO / 真实演示',
    LOCAL: 'LOCAL / 本地运行',
    SOURCE: 'SOURCE / 项目材料',
    FORK: project.demoUrl || project.trialUrl ? 'FORK / 学习版本' : 'FORK / Fork 后运行',
    DEMO: 'DEMO / 站内体验',
    RESEARCH: 'RESEARCH / 研究材料'
  };

  return {
    status: status[project.availability],
    cardHref: fallbackEntry?.href,
    cardLabel: fallbackEntry?.label ?? '材料整理中',
    actions
  };
}

export default function ProjectTrialIndex({
  projects,
  heading = '项目与实验',
  intro = '产品、系统与研究材料，按当前状态归档。'
}: ProjectTrialIndexProps) {
  return (
    <section className="project-trial-index" aria-label="项目试用索引">
      <header className="project-trial-index__heading">
        <div>
          <p className="project-trial-index__eyebrow">W.INDEX / PROJECT TRIALS</p>
          <h2>{heading}</h2>
        </div>
        <p className="project-trial-index__intro">{intro}</p>
      </header>

      {projects.length === 0 ? (
        <p className="project-trial-index__empty">暂时没有可公开的项目入口。</p>
      ) : (
        <ol className="project-trial-index__stack">
          {projects.map((project) => {
            const availability = availabilityView(project);
            const actions = project.evidenceUrl
              ? [
                  ...availability.actions,
                  {
                    href: project.evidenceUrl,
                    label: '查看证据',
                    kind: 'secondary' as const
                  }
                ]
              : availability.actions;
            const summaryId = `project-trial-${project.slug}-summary`;
            const bodyContent = (
              <>
                <div className="project-trial-card__folio">
                  <span>{project.folio}</span>
                  <small>{project.category}</small>
                </div>

                <div className="project-trial-card__content">
                  <div className="project-trial-card__status-row">
                    <span className="project-trial-card__availability">
                      {availability.status}
                    </span>
                    {availability.cardHref && (
                      <span className="project-trial-card__open">
                        {availability.cardLabel}
                        <span aria-hidden="true">
                          {isExternalUrl(availability.cardHref) ? '↗' : '→'}
                        </span>
                      </span>
                    )}
                  </div>

                  <h3>{project.titleZh}</h3>
                  <p className="project-trial-card__name">{project.name}</p>
                  <p className="project-trial-card__summary" id={summaryId}>
                    {project.summary}
                  </p>

                  <ul className="project-trial-card__tags" aria-label="技术标签">
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>

                  <div className="project-trial-card__evidence">
                    <span>{project.evidenceState}</span>
                    <p>{project.evidenceNote}</p>
                  </div>

                  {project.provenance && (
                    <div className="project-trial-card__provenance">
                      <span>PROVENANCE</span>
                      <p>{project.provenance}</p>
                    </div>
                  )}
                </div>
              </>
            );

            return (
              <li
                className={project.featured ? 'project-trial-index__item project-trial-index__item--featured' : 'project-trial-index__item'}
                key={project.slug}
              >
                <article
                  className="project-trial-card"
                  data-availability={project.availability.toLowerCase()}
                >
                  <span className="project-trial-card__tab" aria-hidden="true">
                    {project.featured ? 'MAIN FILE' : project.category}
                  </span>

                  {availability.cardHref ? (
                    <a
                      className="project-trial-card__body"
                      href={availability.cardHref}
                      aria-label={`${project.titleZh}：${availability.cardLabel}${isExternalUrl(availability.cardHref) ? '（新标签页）' : ''}`}
                      aria-describedby={summaryId}
                      {...linkProps(availability.cardHref)}
                    >
                      {bodyContent}
                    </a>
                  ) : (
                    <div className="project-trial-card__body project-trial-card__body--static" aria-describedby={summaryId}>
                      {bodyContent}
                    </div>
                  )}

                  {actions.length > 0 && (
                    <nav
                      className="project-trial-card__actions"
                      aria-label={`${project.name} 项目操作`}
                    >
                      {actions.map((action) => (
                        <a
                          className={`project-trial-card__action project-trial-card__action--${action.kind}`}
                          href={action.href}
                          key={`${action.label}-${action.href}`}
                          aria-label={`${action.label}：${project.name}${isExternalUrl(action.href) ? '（新标签页）' : ''}`}
                          {...linkProps(action.href)}
                        >
                          <span>{action.label}</span>
                          <span aria-hidden="true">
                            {isExternalUrl(action.href) ? '↗' : '→'}
                          </span>
                        </a>
                      ))}
                    </nav>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
