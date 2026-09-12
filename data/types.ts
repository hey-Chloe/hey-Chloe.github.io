/** Content in these collections represents verified work, never sample entries. */
export interface Profile {
  name: string;
  chineseName: string;
  role: string;
  topics: readonly string[];
  description: string;
  biography?: { zh: string; en: string };
  education?: { institution: string; institutionEn: string; degree: string; degreeEn: string; expectedGraduation: string; source: string };
  portrait?: { src: string; alt: string; width: number; height: number };
  github?: string;
  scholar?: string;
  email?: string;
  /** A local PDF path (including the leading slash) or an HTTPS URL. */
  cv?: string;
}

export interface ResearchLinks {
  paper?: string;
  code?: string;
  dataset?: string;
  demo?: string;
  project?: string;
}

export interface ResearchSections {
  abstract: string;
  problem: string;
  method: string;
  architecture: string;
  dataset: string;
  experiments: string;
  results: string;
  ablation: string;
  failureAnalysis: string;
  demo: string;
  citation: string;
}

export interface ResearchImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Research {
  slug: string;
  title: string;
  question: string;
  method: string;
  keyResults: readonly string[];
  venue: string;
  status: string;
  /** Compact visual abstract used in research lists. */
  thumbnail: ResearchImage;
  /** Full statistical evidence figure used in the Results section. */
  resultFigure: ResearchImage;
  links: ResearchLinks;
  sections: ResearchSections;
}

export type ResearchProject = Research;

export interface Publication {
  id: string;
  year: number;
  title: string;
  authors: readonly { name: string; isSelf?: boolean }[];
  venue: string;
  links: { paper?: string; code?: string; project?: string };
  bibtex: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  team?: string;
  /** ISO calendar date: YYYY-MM or YYYY-MM-DD. */
  startDate?: string;
  /** Omit when the role is current or its dates have not yet been verified. */
  endDate?: string;
  problem?: string;
  ownership?: string;
  method?: string;
  scale?: string;
  result?: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  problem: string;
  ownership: string;
  outcome: string;
  year: number;
  tags: readonly string[];
  links: { code?: string; demo?: string; project?: string };
}

export interface OpenSourceContribution {
  id: string;
  title: string;
  kind: "pull-request" | "repository" | "infrastructure";
  repository: string;
  description: string;
  contribution: string;
  result: string;
  status: string;
  links: { code?: string; pullRequest?: string; repository?: string; docs?: string };
}

export interface ContentData {
  profile: Profile;
  research: readonly Research[];
  publications: readonly Publication[];
  experience: readonly Experience[];
  projects: readonly Project[];
  openSource: readonly OpenSourceContribution[];
}
