import Link from 'next/link';

export type Project = {
  name: string;
  description: string;
  techStack: string[];
  href?: string;
};

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const content = (
    <div className="h-full rounded-2xl border border-line bg-white/80 p-5 shadow-card transition hover:-translate-y-1 hover:border-rose/40">
      <h3 className="text-lg font-bold text-gray-950">{project.name}</h3>
      <p className="mt-3 text-sm leading-7 text-gray-600">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span key={tech} className="rounded-full border border-line bg-soft px-2.5 py-1 text-xs font-medium text-gray-600">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );

  if (!project.href) {
    return content;
  }

  return (
    <Link href={project.href} className="block h-full">
      {content}
    </Link>
  );
}
