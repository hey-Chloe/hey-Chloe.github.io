import type { EvidenceState } from '@/components/EvidenceBadge';

export type ProjectAvailability = 'LIVE' | 'VIDEO' | 'LOCAL' | 'SOURCE' | 'FORK';

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
  repoUrl: string;
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
  cardHref: string;
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

function availabilityView(project: ProjectEntry): AvailabilityView {
  const sourceAction: ProjectAction = {
    href: project.repoUrl,
    label: '查看源码',
    kind: 'secondary'
  };

  if (project.availability === 'LIVE' && project.demoUrl) {
    const actions: ProjectAction[] = [
      { href: project.demoUrl, label: '在线试用', kind: 'primary' }
    ];

    if (project.guideUrl) {
      actions.push({ href: project.guideUrl, label: '使用说明', kind: 'secondary' });
    }

    actions.push(sourceAction);
    return {
      status: 'LIVE / 在线试用',
      cardHref: project.caseUrl ?? project.demoUrl,
      cardLabel: '打开在线试用',
      actions
    };
  }

  if (project.availability === 'VIDEO' && project.demoUrl) {
    return {
      status: 'VIDEO / 真实演示',
      cardHref: project.caseUrl ?? project.demoUrl,
      cardLabel: project.caseUrl ? '打开项目档案' : '观看项目演示',
      actions: [
        { href: project.demoUrl, label: project.demoLabel ?? '观看演示', kind: 'primary' },
        ...(project.guideUrl ? [{ href: project.guideUrl, label: '本地运行', kind: 'secondary' as const }] : []),
        sourceAction
      ]
    };
  }

  if (project.availability === 'LOCAL') {
    if (project.guideUrl) {
      return {
        status: 'LOCAL / 本地运行',
        cardHref: project.caseUrl ?? project.guideUrl,
        cardLabel: project.caseUrl ? '打开项目档案' : '打开本地运行指南',
        actions: [
          { href: project.guideUrl, label: '本地运行', kind: 'primary' },
          sourceAction
        ]
      };
    }

    return {
      status: 'LOCAL / 本地运行',
      cardHref: project.repoUrl,
      cardLabel: '查看源码并在本地运行',
      actions: [
        {
          href: project.repoUrl,
          label: '本地运行 · 查看源码',
          kind: 'primary'
        }
      ]
    };
  }

  if (project.availability === 'FORK') {
    if (project.demoUrl) {
      return {
        status: 'FORK / 学习版本',
        cardHref: project.demoUrl,
        cardLabel: '打开学习版本',
        actions: [
          { href: project.demoUrl, label: project.demoLabel ?? '打开学习版本', kind: 'primary' },
          sourceAction
        ]
      };
    }

    if (project.guideUrl) {
      return {
        status: 'FORK / Fork 后运行',
        cardHref: project.guideUrl,
        cardLabel: '打开 Fork 运行指南',
        actions: [
          { href: project.guideUrl, label: 'Fork 后运行', kind: 'primary' },
          sourceAction
        ]
      };
    }

    return {
      status: 'FORK / Fork 后运行',
      cardHref: project.repoUrl,
      cardLabel: '查看源码并 Fork 运行',
      actions: [
        {
          href: project.repoUrl,
          label: 'Fork 后运行 · 查看源码',
          kind: 'primary'
        }
      ]
    };
  }

  const sourceActions: ProjectAction[] = [];
  if (project.guideUrl) {
    sourceActions.push({ href: project.guideUrl, label: '阅读说明', kind: 'secondary' });
  }
  sourceActions.push(sourceAction);

  return {
    status: project.availability === 'LIVE'
      ? 'LIVE / 试用入口待补'
      : 'SOURCE / 查看源码',
    cardHref: project.repoUrl,
    cardLabel: '查看项目源码',
    actions: sourceActions
  };
}

export default function ProjectTrialIndex({
  projects,
  heading = '打开项目，亲自试一试。',
  intro = '能直接打开的作品标为在线试用；其余项目会明确提供本地运行方式或源码入口。'
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

                  <a
                    className="project-trial-card__body"
                    href={availability.cardHref}
                    aria-label={`${project.titleZh}：${availability.cardLabel}${isExternalUrl(availability.cardHref) ? '（新标签页）' : ''}`}
                    aria-describedby={summaryId}
                    {...linkProps(availability.cardHref)}
                  >
                    <div className="project-trial-card__folio">
                      <span>{project.folio}</span>
                      <small>{project.category}</small>
                    </div>

                    <div className="project-trial-card__content">
                      <div className="project-trial-card__status-row">
                        <span className="project-trial-card__availability">
                          {availability.status}
                        </span>
                        <span className="project-trial-card__open">
                          {availability.cardLabel}
                          <span aria-hidden="true">
                            {isExternalUrl(availability.cardHref) ? '↗' : '→'}
                          </span>
                        </span>
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
                  </a>

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
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
