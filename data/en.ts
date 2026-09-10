import { research as originalResearch } from "./research";
import { projects as originalProjects } from "./projects";
import { openSource as originalOpenSource } from "./open-source";
import { siteCopy as originalSiteCopy } from "./site-copy";
import type { OpenSourceContribution, Project, Research } from "./types";

type ResearchTranslation = Pick<Research, "title" | "question" | "method" | "keyResults" | "venue" | "status"> & {
  thumbnailAlt: string;
  thumbnailSrc: string;
  resultFigureAlt: string;
  resultFigureSrc: string;
  sections: Omit<Research["sections"], "citation">;
};

/** Translate presentation only; identifiers, evidence links, and citations remain shared. */
const researchTranslations: Record<string, ResearchTranslation> = {
  "ordered-agent-credit": {
    title: "MiniClaudeCode: Ordered Trajectory Credit & Agent Evaluation",
    question: "How should actions receive credit when tool trajectories contain prerequisites, interactions, and failure recovery?",
    method: "Constrain counterfactual replay with a precedence DAG, combining exact enumeration, uniform sampling of valid orders, and offline evaluation.",
    keyResults: [
      "Under the controlled protocol, precedence-constrained estimates are closer to the prefix reference than vanilla Shapley.",
      "Exact estimation, sampling convergence, and replay-validity analyses are publicly documented.",
    ],
    venue: "Independent project",
    status: "Offline estimator study",
    thumbnailSrc: "/images/research-agent-teaser-en.webp",
    thumbnailAlt: "Visual abstract of ordered trajectory attribution, from precedence dependencies and valid linear extensions to exact or uniform estimation and convergence evidence.",
    resultFigureSrc: "/images/research-agent-en.png",
    resultFigureAlt: "Line chart of attribution RMSE versus sampling budget with a seed-level confidence interval under a controlled structural protocol.",
    sections: {
      abstract: "This study uses MiniClaudeCode tool traces to examine credit assignment when actions have prerequisites. The project also provides a bounded agent loop, tool policies, checkpoints, and evaluation infrastructure; the research focus here is offline ordered attribution.",
      problem: "Vanilla Shapley considers coalitions such as edit without read, even when they violate action dependencies. Preserving order within a subset does not make those counterfactuals executable. The question is how to define and estimate marginal credit under explicit precedence constraints.",
      method: "Represent dependencies as a DAG and average marginal contributions only over valid linear extensions. Enumerate small sets exactly; for larger sets, use dynamic programming to count completions and sample each next action proportionally, producing uniform samples of valid orders.",
      architecture: "A bounded Controller connects the LLM Driver, tool registry, policy, and runtime to recorded ToolObservations. The attribution module separately consumes a trajectory, precedence graph, and replayable utility function, returning credit vectors, standard errors, and efficiency residuals.",
      dataset: "The controlled study generates eight variants from each of five structures: chain interactions, failure recovery, redundant evidence, parallel evidence, and policy guards. These are synthetic protocols with declared utility functions, not forty independent real coding tasks or production-user data.",
      experiments: "Compare uniform, position, cost, leave-one-out, vanilla Shapley, and precedence-constrained Shapley baselines. Additional checks examine invalid coalitions, sampling budgets, and replay determinism. Scripts and structural-protocol results are published as JSON reports.",
      results: "The committed report finds lower error for precedence-constrained estimates against the protocol's prefix-sequential reference, and lower average error against the exact reference as sampling increases. These observations concern this estimator protocol, not real coding success, causal identification, or policy-training gains.",
      ablation: "Compare credit baselines and convergence across sampling budgets and seeds. A strict chain reduces to prefix-conditioned sequential marginals; a partial order permits independent actions to exchange positions. Correctness of the declared precedence graph remains an assumption.",
      failureAnalysis: "Attribution loses its basis if replay is nondeterministic or the DAG excludes feasible orders. Public live traces lack per-action workspace snapshots, so they do not support real-task counterfactual coalition replay. Included third-party training code is not evidence that this project trained an RL policy.",
      demo: "Run python -m evaluation.trajectory_credit_study from the repository to reproduce the offline structural protocol. Coding evaluation with a real model follows a separate execution path and is reported separately from offline validation.",
    },
  },
  "offline-retrieval-ranking": {
    title: "KAI Offline RecSys Lab: Retrieval-to-Reranking Evaluation",
    question: "How can retrieval, negative sampling, and reranking be compared under the same population, data splits, and candidate sets?",
    method: "Freeze Two-Tower retrieval and Exact / HNSW candidates, compare DIN / DCN rerankers, and apply train-only calibration with paired user-level evaluation.",
    keyResults: [
      "DIN reranking improves ordering within the same candidate sets under the frozen offline protocol.",
      "Uniform negatives win this dev comparison; feature dependencies and ANN trade-offs remain visible.",
    ],
    venue: "Independent project",
    status: "Public data · offline experiments",
    thumbnailSrc: "/images/research-recsys-teaser-en.webp",
    thumbnailAlt: "Visual abstract of a frozen offline recommendation protocol, from shared users and Exact Top-100 candidates to DIN reranking and paired evaluation.",
    resultFigureSrc: "/images/research-recsys-en.png",
    resultFigureAlt: "Estimate plot comparing Exact retrieval and DIN reranking means, with a separate paired-difference 95% interval under the same frozen protocol.",
    sections: {
      abstract: "A personal public-data lab covering candidate retrieval, reranking, calibration, and cohort evaluation. Its aim is to compare models under explicit shared protocols while distinguishing recommendation quality, ANN systems measurements, and business outcomes.",
      problem: "Ranking metrics may not be comparable when candidate sets, populations, negative sampling, or feature sources differ. Frozen retrieval snapshots, dev-only selection, and a defined test-opening sequence reduce the risk of confusing protocol changes with model gains.",
      method: "Amazon V3 starts from an existing Two-Tower checkpoint and builds Exact / HNSW Top-100 candidates. It compares hard, uniform, and in-batch negatives with DIN / DCN-style reranking. Temperature calibration uses training data only; dev NDCG@100 selects the candidate before paired user-level differences are evaluated on the frozen test set.",
      architecture: "Public data and provenance ledger → shared splits and features → retrieval snapshot → reranker training and dev selection → frozen manifest → offline test and bootstrap → interactive report. The million-item HNSW extension is a separate local systems-measurement path.",
      dataset: "The main quality experiment uses Amazon Reviews’23 Industrial_and_Scientific with a fixed 5-core protocol. Public reports describe a 25,754-item catalog and 50,653 common test users. Raw third-party records and trained weights are not distributed with the repository.",
      experiments: "Compare retrieval, negatives, reranking, calibration, feature dependencies, and cohort support, alongside HNSW recall–latency–index-size diagnostics. Selection uses the development set; configurations, split summaries, and frozen results are recorded together.",
      results: "In the public V3 summary, dev-selected exact-din-uniform-64-32 achieves higher test NDCG@100 than exact retrieval ordering under the same protocol, with a reported paired bootstrap interval excluding zero. The result applies to that offline population and protocol, not online CTR, CVR, revenue, or service SLAs.",
      ablation: "Zero metadata, ID, title, and category inputs to inspect the frozen model's feature dependencies. This is inference-time input zeroing, not a fully retrained ablation. Hard negatives do not win this round of dev selection.",
      failureAnalysis: "The frozen protocol does not support performance claims for true new users, users without history, or unseen target items; unsupported cohorts are reported explicitly. Aggregate checks cannot replace independent retraining with the unpublished raw data and artifacts. The million-item index experiment is not a million-item relevance benchmark.",
      demo: "The public Playground reads committed reports and presents V3 comparisons, feature dependencies, HNSW trade-offs, and cohort support as static experiment replay. make reproduce-small checks the end-to-end code path on explicitly synthetic data; it does not validate reported public-data performance.",
    },
  },
  "vlm-data-selection": {
    title: "Qwen2.5-VL: Data Selection Under a Small Fine-Tuning Budget",
    question: "With the model, training budget, and held-out evaluation fixed, can data selection improve multimodal fine-tuning over random sampling?",
    method: "Compare Random-1K and faithful COINCIDE-1K on ScienceQA with the same Qwen2.5-VL-3B, LoRA / SFT settings, and paired seeds.",
    keyResults: [
      "In the public summary, COINCIDE-1K trails Random-1K across all three paired seeds.",
      "Negative results, a confidence interval crossing zero, and selection-mismatch analysis are retained.",
    ],
    venue: "Independent project",
    status: "Offline experiment · public summary",
    thumbnailSrc: "/images/research-vlm-teaser-en.webp",
    thumbnailAlt: "Visual abstract of a paired multimodal data-selection study with one ScienceQA budget, shared Qwen2.5-VL-3B LoRA settings, and three paired seeds.",
    resultFigureSrc: "/images/research-vlm-en.png",
    resultFigureAlt: "Paired held-out exact-match results across three seeds comparing Random-1K and COINCIDE-1K data selection.",
    sections: {
      abstract: "An investigation of whether data selection can outperform random sampling under a limited fine-tuning budget. The Qwen2.5-VL-3B LoRA / SFT study publishes paired-seed summaries, failure analysis, and a static evidence viewer, retaining the observed lack of improvement and questions for further validation.",
      problem: "More elaborate data selection does not necessarily improve downstream results. Fixing the base model, training settings, sample budget, and held-out protocol—and retaining failures—helps separate the selection strategy from other experimental conditions.",
      method: "The public summary describes a paired comparison of Random-1K and faithful COINCIDE-1K using identical Qwen2.5-VL-3B and LoRA / assistant-only SFT settings. Three seeds are compared using exact match and loss.",
      architecture: "ScienceQA samples and selection manifests → Random / COINCIDE selection → shared model and LoRA settings → held-out evaluation → paired results and failure analysis → static JSON viewer. The public page runs neither training nor live inference.",
      dataset: "The study uses ScienceQA. The main summary covers a 1K training budget and held-out-256 evaluation. The demo separately contains 128 training examples and a small prediction replay; those training examples cannot substitute for held-out predictions as evidence of generalization.",
      experiments: "The public summary reports three seeds for each of two selection methods, for six training runs. A snapshot stores paired results, configuration hashes, and provenance markers. Exact match, loss, paired differences, and failure cases are examined at the fixed training budget.",
      results: "In the public snapshot, COINCIDE exact match is lower than Random for each paired seed, while the reported seed-level difference interval crosses zero. This retains a finding of no observed gain in the current setting, not a claim that data selection is ineffective in general.",
      ablation: "The published core comparison uses a fixed 1K budget and includes an untuned Base reference. Data-size curves for 250, 500, 2K, 4K, and Full are marked as not run; no missing ablation or scale results are supplied.",
      failureAnalysis: "Public materials contain paired error analysis, but training source, complete held-out predictions, and some raw artifacts remain unpublished. Selection mismatch is an explanation requiring further validation, not an established mechanism. The sample and seed counts also limit broader conclusions.",
      demo: "The viewer reads experiment status, examples, and summaries from a static snapshot without an API. Training-example replay is distinct from the main held-out results. The snapshot has no sample-level Base / LoRA pairs for display, and the page provides no live cloud inference.",
    },
  },
};

export const research: readonly Research[] = originalResearch.map((item) => {
  const translation = researchTranslations[item.slug];
  // Preserve newly supplied records and isolated QA fixtures until translated.
  if (!translation) return item;
  const { thumbnailAlt, thumbnailSrc, resultFigureAlt, resultFigureSrc, sections, ...copy } = translation;
  return {
    ...item,
    ...copy,
    thumbnail: { ...item.thumbnail, src: thumbnailSrc, alt: thumbnailAlt },
    resultFigure: { ...item.resultFigure, src: resultFigureSrc, alt: resultFigureAlt },
    sections: { ...sections, citation: item.sections.citation },
  };
});

type ProjectTranslation = Pick<Project, "description" | "problem" | "ownership" | "outcome">;
const projectTranslations: Record<string, ProjectTranslation> = {
  "miniclaudecode-studio": {
    description: "A Chinese-language agent workspace that brings plans, tool calls, approvals, code diffs, tests, and checkpoint recovery into one traceable workflow.",
    problem: "Make agent execution, file changes, and verification outcomes observable and distinct.",
    ownership: "The personal repository's Studio adapter and interface reuse MiniClaudeCode's native execution engine. The public version replays recordings; the local version connects to the actual runtime.",
    outcome: "A local workspace, static replays, and a small online evaluation distinguish execution ending, functional correctness, and final verification, while retaining failures caused by permissions and interpreter selection.",
  },
  "ruleforge-sast": {
    description: "A static-analysis workflow for PHP, Python, and Java: rule scanning, vulnerability explanations, AI repair suggestions, rescanning, and history.",
    problem: "Separate an AI repair suggestion from scanner findings, with inspectable evidence before and after a change.",
    ownership: "The personal repository connects language and rule selection, scan records, AI suggestions, and Patch Verify across the frontend and backend. Detection uses Semgrep and existing rules.",
    outcome: "Scanning, AI suggestions, and repair checks form a traceable workflow with a demo and scan history. FIXED means the current rule no longer matches; coverage depends on the rules used.",
  },
};

export const projects: readonly Project[] = originalProjects.map((item) => {
  const translation = projectTranslations[item.slug];
  if (!translation) return item;
  return { ...item, ...translation };
});

type ContributionTranslation = Pick<OpenSourceContribution, "title" | "description" | "contribution" | "result" | "status">;
const contributionTranslations: Record<string, ContributionTranslation> = {
  "pyrit-api-key-scenario": {
    title: "PyRIT: Garak API-key Scenario & Scorer",
    description: "External contribution PR #2538 adds API-key generation and completion probes to the Garak scenario family.",
    contribution: "Submitted the scenario, fixed corpora, CredentialLeakScorer extensions, tests, and documentation. The implementation distinguishes credential-shaped values from public identifiers and excludes request echoes and supplied test fragments.",
    result: "The code diff and test notes are public. The contribution is submitted but unmerged; submission alone does not establish maintainer endorsement or validation against live targets.",
    status: "Submitted · not merged (2026-09-09)",
  },
  "miniclaudecode-runtime": {
    title: "MiniClaudeCode: Observable Execution & Evaluation Infrastructure",
    description: "A personally maintained coding-agent reference implementation focused on execution boundaries, tool events, checkpoints, and evaluation.",
    contribution: "Published a bounded control loop, tool registration and policy interfaces, session persistence, trajectory attribution, and evaluation scripts. Third-party training frameworks carry separate attribution.",
    result: "Source, controlled reports, and test entry points are available. Offline harness validation is distinct from real-model task solving; the repository currently grants no additional open-source license.",
    status: "Personal repository · source available",
  },
  "recsys-evaluation-infrastructure": {
    title: "KAI RecSys Lab: Experiment Protocols & Reporting Tools",
    description: "Provenance ledgers, frozen configurations, evaluation reports, and portable experiment views built around public data.",
    contribution: "Connect retrieval, reranking, calibration, and paired statistics under one offline protocol, with synthetic-path reproduction, public-report checks, and a static Playground.",
    result: "Reports distinguish public-data experiments, synthetic integration checks, ANN systems measurements, and local serving rehearsals, without presenting offline findings as online business gains.",
    status: "Personal repository · research infrastructure",
  },
};

export const openSource: readonly OpenSourceContribution[] = originalOpenSource.map((item) => {
  const translation = contributionTranslations[item.id];
  if (!translation) return item;
  return { ...item, ...translation };
});

type SiteCopy = {
  [Section in keyof typeof originalSiteCopy]: {
    [Field in keyof (typeof originalSiteCopy)[Section]]: string;
  };
};

export const siteCopy: SiteCopy = {
  hero: {
    introduction: "Recent public work includes agent execution and failure attribution in MiniClaudeCode, retrieval and reranking evaluation in KAI Offline RecSys Lab, and data selection and LoRA training studies with Qwen2.5-VL.",
    introductionChinese: "My interests span language models, multimodal learning, and agent systems, especially evaluation protocols, failure attribution, and reproducible experiments. I aim to turn research questions into systems that can be run, analyzed, and tested.",
    interestsTitle: "Research interests",
    unavailableLink: "Details to be added",
    contactNote: "More public materials are being prepared.",
  },
  research: {
    eyebrow: "01 / RESEARCH",
    title: "Selected Research",
    description: "Independent research and engineering explorations, organized around questions, methods, and evidence.",
    emptyTitle: "A space for the work.",
    emptyDescription: "Research projects will appear here once their details and supporting materials are available.",
  },
  experience: {
    eyebrow: "02 / EXPERIENCE",
    title: "Research & Industry",
    description: "The problems, responsibilities, and results behind each role.",
    emptyTitle: "Research and industry experience",
    emptyDescription: "Confirmed roles, teams, and responsibilities will be added here.",
  },
  publications: {
    eyebrow: "03 / PUBLICATIONS",
    title: "Publications",
    description: "Papers, accompanying code, and citations, organized by year.",
    emptyTitle: "Publications will be listed here.",
    emptyDescription: "No publication records have been provided yet.",
  },
  openSource: {
    eyebrow: "04 / OPEN SOURCE",
    title: "Open Source",
    description: "Contributions, maintained repositories, and infrastructure for reproducible research.",
    emptyTitle: "Contributions that can be traced.",
    emptyDescription: "Verified pull requests, repositories, and infrastructure work will appear here.",
  },
  engineering: {
    eyebrow: "05 / ENGINEERING",
    title: "Engineering",
    description: "AI systems and full-stack tools, from implementation to operation.",
    emptyTitle: "From an idea to a working system.",
    emptyDescription: "Engineering projects will be added with their scope, contribution, and outcomes.",
  },
  writing: {
    eyebrow: "06 / WRITING",
    title: "Research Notes",
    description: "Technical notes on models, experiments, and the practice of building AI systems.",
    emptyTitle: "Questions, experiments, and reflections",
    emptyDescription: "Research notes and technical writing are being prepared.",
  },
  cv: {
    title: "Curriculum vitae",
    description: "Research, experience, and selected work in one place.",
    emptyTitle: "CV coming soon.",
    emptyDescription: "A downloadable CV will be available once the verified document is provided.",
  },
};

/** Interest statements are positioning, not claims of completed work. */
export const researchInterests = [
 {id:"language-models",number:"01",title:"Language models",description:"Reasoning, adaptation, and the behavior of large language models."},
 {id:"multimodal",number:"02",title:"Multimodal systems",description:"Learning across language, vision, and other modalities."},
 {id:"agents-evaluation",number:"03",title:"Agents & evaluation",description:"Tool use, reliable interaction, and evaluation beyond a single answer."},
] as const;
