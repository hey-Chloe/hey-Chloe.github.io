const state = {
  snapshot: null,
  selectedIndex: 0,
  demo: {
    running: false,
    startedAt: 0,
    activeStep: -1,
    timer: null,
  },
};

const els = {};

const DEMO_STEPS = [
  {
    durationMs: 10000,
    target: "#demo-image-step",
    label: "01 / 看图片",
    caption: "先看真实 ScienceQA 图片：这是一个需要视觉理解的任务。",
  },
  {
    durationMs: 12000,
    target: "#demo-question-step",
    label: "02 / 看问题",
    caption: "模型还要理解问题，并在 A / B / C / D 中做选择。",
  },
  {
    durationMs: 10000,
    target: "#demo-ai-step",
    label: "03 / 看 AI 任务",
    caption: "Ground Truth 来自冻结数据；这里展示的是已回收的真实 LoRA checkpoint 输出。",
  },
  {
    durationMs: 13000,
    target: "#demo-training-step",
    label: "04 / 看训练证明",
    caption: "模型已在真实 CUDA GPU 上完成 128-sample LoRA / SFT 训练闭环。",
  },
  {
    durationMs: 15000,
    target: "#demo-result-step",
    label: "05 / 看研究结论",
    caption: "同一训练预算下，Random-1000 在三个种子都胜过 COINCIDE-1000；负结果同样有研究价值。",
  },
];

const DEMO_TOTAL_MS = DEMO_STEPS.reduce((total, step) => total + step.durationMs, 0);

function byId(id) {
  return document.getElementById(id);
}

function text(el, value) {
  el.textContent = value ?? "—";
}

function make(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function formatInteger(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatBytes(value) {
  return `${(value / (1024 ** 3)).toFixed(2)} GiB`;
}

function formatSeconds(value) {
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  return minutes ? `${minutes}m ${seconds.toFixed(2)}s` : `${seconds.toFixed(2)}s`;
}

function formatPercent(value, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatSignedPoints(value) {
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(2)} pp`;
}

function shortRevision(value) {
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

function humanResearchState(value) {
  const labels = {
    COMPLETE: "已完成",
    FROZEN: "已冻结",
    REMOTE_COMPLETE_RAW_SYNC_PENDING: "远端已完成 · 原始产物待同步",
    NOT_RUN_REMOTE_LAUNCH_PENDING: "未运行 · 等待远端启动",
    NOT_RUN: "未运行",
  };
  return labels[value] || value.replaceAll("_", " ");
}

function cacheElements() {
  [
    "project-story",
    "hero-facts",
    "sample-select",
    "sample-counter",
    "sample-image",
    "question",
    "choices",
    "original-question",
    "original-choices",
    "ground-truth",
    "prediction",
    "prediction-source",
    "research-question",
    "research-status",
    "research-finding",
    "research-result-metrics",
    "seed-results",
    "research-claim-boundary",
    "flow-model",
    "run-status",
    "training-proof-title",
    "training-proof-subtitle",
    "metric-grid",
    "technical-list",
    "evidence-boundary",
    "roadmap",
    "manifest-footer",
    "demo-mode-toggle",
    "demo-controller",
    "demo-step-label",
    "demo-caption",
    "demo-progress",
    "demo-countdown",
    "demo-stop",
    "fatal-error",
  ].forEach((id) => {
    els[id] = byId(id);
  });
}

function renderHero() {
  const inspector = state.snapshot.inspector;
  const model = inspector.model.id.replace("Qwen/", "");
  const gpu = inspector.hardware.gpu;
  text(
    els["project-story"],
    `我在 ${gpu} 上用 LoRA 微调 ${model}，让模型学习 ScienceQA 图文问答，并进一步研究如何选择更有价值的训练数据。`,
  );
  els["hero-facts"].replaceChildren();
  [model, gpu, "LoRA / SFT", "ScienceQA"].forEach((fact) => {
    els["hero-facts"].append(make("li", "", fact));
  });
}

function renderSample(index) {
  const sample = state.snapshot.samples[index];
  state.selectedIndex = index;
  els["sample-select"].value = String(index);
  text(els["sample-counter"], `${String(index + 1).padStart(3, "0")} / ${state.snapshot.samples.length}`);
  els["sample-image"].src = sample.image_url;
  els["sample-image"].alt = `ScienceQA 图片：${sample.question_zh}`;
  text(els.question, sample.question_zh);

  els.choices.replaceChildren();
  sample.choices_zh.forEach((choice, choiceIndex) => {
    const item = make("li", "choice-item");
    item.append(
      make("span", "choice-label", String.fromCharCode(65 + choiceIndex)),
      make("span", "choice-copy", choice),
    );
    els.choices.append(item);
  });

  text(els["original-question"], sample.question);
  els["original-choices"].replaceChildren();
  sample.choices.forEach((choice, choiceIndex) => {
    els["original-choices"].append(
      make("li", "", `${String.fromCharCode(65 + choiceIndex)}. ${choice}`),
    );
  });

  text(els["ground-truth"], `${sample.ground_truth.label}. ${sample.ground_truth.text_zh}`);
  if (sample.prediction) {
    text(els.prediction, sample.prediction.prediction || "（模型返回空字符串）");
    text(els["prediction-source"], `真实输出来源：${sample.prediction.label}`);
    els.prediction.closest(".answer-panel").dataset.state = "available";
  } else {
    text(els.prediction, "模型预测结果等待远端 artifact 同步");
    text(els["prediction-source"], "当前不使用正确答案代替模型预测");
    els.prediction.closest(".answer-panel").dataset.state = "waiting";
  }
  renderTechnicalDetails();
}

function renderResearch() {
  const result = state.snapshot.research.result;
  text(els["research-question"], state.snapshot.research.question);
  text(els["flow-model"], state.snapshot.inspector.model.id.replace("Qwen/", ""));
  els["research-status"].replaceChildren();
  state.snapshot.research.status.forEach((stage) => {
    const row = make("div", `status-row tone-${stage.tone}`);
    const copy = make("div", "status-copy");
    copy.append(make("strong", "", stage.label));
    row.append(copy, make("span", "status-value", humanResearchState(stage.state)));
    els["research-status"].append(row);
  });

  text(els["research-finding"], result.finding);
  els["research-result-metrics"].replaceChildren(
    metric("Base", formatPercent(result.base_exact_match)),
    metric("Random-1000 均值", formatPercent(result.random_exact_match_mean)),
    metric("COINCIDE-1000 均值", formatPercent(result.coincide_exact_match_mean)),
    metric("配对差值", formatSignedPoints(result.paired_delta_mean)),
  );
  els["seed-results"].replaceChildren();
  result.paired_seed_results.forEach((row) => {
    const item = make("div", "seed-row");
    item.append(
      make("span", "seed-id", `seed ${row.seed}`),
      make("span", "seed-random", `Random ${formatPercent(row.random_exact_match)}`),
      make("span", "seed-coincide", `COINCIDE ${formatPercent(row.coincide_exact_match)}`),
      make("strong", "seed-delta", formatSignedPoints(row.exact_match_delta)),
    );
    els["seed-results"].append(item);
  });
  text(els["research-claim-boundary"], result.claim_boundary);
}

function metric(label, value) {
  const item = make("div", "metric-item");
  item.append(make("p", "metric-label", label), make("p", "metric-value", value));
  return item;
}

function renderTraining() {
  const inspector = state.snapshot.inspector;
  const training = inspector.training;
  const hardware = inspector.hardware;
  const model = inspector.model;
  const closure = inspector.closure;

  text(els["run-status"], `${inspector.run.job_id} · 训练闭环已完成`);
  text(els["training-proof-title"], `${model.id.replace("Qwen/", "")} × ${hardware.gpu}`);
  text(
    els["training-proof-subtitle"],
    `${training.dataset_samples} 个样本 · ${training.global_step} 次优化步骤 · ${model.training_method}`,
  );
  els["metric-grid"].replaceChildren(
    metric("模型参数", formatInteger(model.parameter_count)),
    metric("训练样本", `${training.dataset_samples}`),
    metric("优化步骤", `${training.global_step}`),
    metric("训练时长", formatSeconds(training.training_wall_seconds)),
    metric("吞吐量", `${training.samples_per_second.toFixed(3)} samples/s`),
    metric("峰值已分配显存", formatBytes(hardware.peak_cuda_allocated_bytes)),
    metric("峰值保留显存", formatBytes(hardware.peak_cuda_reserved_bytes)),
    metric("LoRA", `r${model.lora.r} / α${model.lora.alpha}`),
  );
}

function appendDefinition(list, term, value, code = false) {
  const dt = make("dt", "", term);
  const dd = make("dd");
  dd.append(make(code ? "code" : "span", "", value));
  list.append(dt, dd);
}

function renderTechnicalDetails() {
  if (!state.snapshot) return;
  const sample = state.snapshot.samples[state.selectedIndex];
  const inspector = state.snapshot.inspector;
  const evidence = state.snapshot.evidence;
  const closure = inspector.closure;
  const list = els["technical-list"];
  list.replaceChildren();

  appendDefinition(list, "Selected sample", sample.sample_id, true);
  appendDefinition(list, "Upstream PID", sample.upstream_pid, true);
  appendDefinition(list, "Image dimensions", `${sample.image_width} × ${sample.image_height} px`);
  appendDefinition(list, "Checkpoint", inspector.training.checkpoint, true);
  appendDefinition(list, "Model revision", inspector.model.revision, true);
  appendDefinition(list, "Dataset revision", evidence.dataset_revision, true);
  appendDefinition(list, "中文界面层", evidence.translation.status, true);
  appendDefinition(list, "翻译文件 SHA-256", evidence.translation.sha256, true);
  appendDefinition(list, "J02 config SHA-256", evidence.config_sha256, true);
  appendDefinition(list, "J02 manifest SHA-256", evidence.manifest_sha256, true);
  appendDefinition(list, "Campaign summary SHA-256", evidence.campaign_summary_sha256, true);
  appendDefinition(list, "Recovery archive SHA-256", evidence.recovery_archive_sha256, true);
  appendDefinition(
    list,
    "Checkpoint reload",
    closure.checkpoint_reload_reported ? "REPORTED TRUE" : "NOT REPORTED",
  );
  appendDefinition(
    list,
    "Evaluation",
    closure.evaluation_artifacts_reported ? "ARTIFACTS REPORTED" : "NOT REPORTED",
  );
  appendDefinition(list, "Determinism", closure.determinism_state, true);
  appendDefinition(list, "Local artifact state", closure.local_verification, true);
  text(
    els["evidence-boundary"],
    "J02 与六个 1K run 的原始日志、adapter、逐样本预测、loss、显存遥测和确定性证明均已回收到本机并完成哈希校验；optimizer state 与中间 checkpoint 为控制体积未回收。Base 与 J02 的样本集不同，因此不伪造 Before / After 对照。",
  );
}

function renderRoadmap() {
  els.roadmap.replaceChildren();
  state.snapshot.roadmap.forEach((stage, index) => {
    const item = make("li", `roadmap-item tone-${stage.tone}`);
    const heading = make("div", "roadmap-heading");
    heading.append(
      make("span", "roadmap-number", String(index + 1).padStart(2, "0")),
      make("strong", "", `${stage.id} · ${stage.label}`),
    );
    item.append(
      heading,
      make("span", "roadmap-state", stage.state),
      make("code", "roadmap-source", stage.source),
    );
    if (stage.detail) item.append(make("p", "roadmap-detail", stage.detail));
    els.roadmap.append(item);
  });
}

function clearDemoTarget() {
  document.querySelectorAll(".demo-active").forEach((node) => node.classList.remove("demo-active"));
}

function activateDemoStep(index) {
  if (state.demo.activeStep === index) return;
  clearDemoTarget();
  state.demo.activeStep = index;
  const step = DEMO_STEPS[index];
  const target = document.querySelector(step.target);
  if (!target) return;
  target.classList.add("demo-active");
  text(els["demo-step-label"], step.label);
  text(els["demo-caption"], step.caption);
  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "center",
  });
}

function stopDemo(completed = false) {
  if (state.demo.timer) window.clearInterval(state.demo.timer);
  state.demo.timer = null;
  state.demo.running = false;
  state.demo.activeStep = -1;
  clearDemoTarget();
  document.body.classList.remove("demo-running");
  els["demo-mode-toggle"].setAttribute("aria-pressed", "false");
  text(els["demo-mode-toggle"], completed ? "↻ 重新播放 60 秒 Demo" : "▶ 启动 60 秒 Demo");
  if (completed) {
    text(els["demo-step-label"], "演示完成");
    text(els["demo-caption"], "60 秒演示完成：任务、训练证据与 Data Selection 负结果已讲完。");
    els["demo-progress"].value = DEMO_TOTAL_MS;
    text(els["demo-countdown"], "完成");
  } else {
    els["demo-controller"].hidden = true;
  }
}

function tickDemo() {
  const elapsed = Math.min(performance.now() - state.demo.startedAt, DEMO_TOTAL_MS);
  els["demo-progress"].value = elapsed;
  text(els["demo-countdown"], `${Math.max(0, Math.ceil((DEMO_TOTAL_MS - elapsed) / 1000))}s`);

  let cumulative = 0;
  let nextStep = DEMO_STEPS.length - 1;
  for (let index = 0; index < DEMO_STEPS.length; index += 1) {
    cumulative += DEMO_STEPS[index].durationMs;
    if (elapsed < cumulative) {
      nextStep = index;
      break;
    }
  }
  activateDemoStep(nextStep);
  if (elapsed >= DEMO_TOTAL_MS) stopDemo(true);
}

function startDemo() {
  if (state.demo.running) {
    stopDemo(false);
    return;
  }
  state.demo.running = true;
  state.demo.startedAt = performance.now();
  state.demo.activeStep = -1;
  document.body.classList.add("demo-running");
  els["demo-controller"].hidden = false;
  els["demo-mode-toggle"].setAttribute("aria-pressed", "true");
  text(els["demo-mode-toggle"], "■ 停止 Demo Mode");
  tickDemo();
  state.demo.timer = window.setInterval(tickDemo, 200);
}

function bindInteractions() {
  els["sample-select"].addEventListener("change", (event) => {
    renderSample(Number(event.target.value));
  });
  els["demo-mode-toggle"].addEventListener("click", startDemo);
  els["demo-stop"].addEventListener("click", () => stopDemo(false));
}

function render(snapshot) {
  state.snapshot = snapshot;
  els["sample-select"].replaceChildren();
  snapshot.samples.forEach((sample, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${String(index + 1).padStart(3, "0")} · ${sample.question_zh}`;
    els["sample-select"].append(option);
  });
  text(els["manifest-footer"], `${snapshot.evidence.verified_sample_images} 张图片已校验 · ${snapshot.evidence.manifest}`);
  renderHero();
  renderResearch();
  renderTraining();
  renderRoadmap();
  const firstPrediction = snapshot.samples.findIndex((sample) => sample.prediction);
  renderSample(firstPrediction >= 0 ? firstPrediction : 0);
  bindInteractions();
}

async function init() {
  cacheElements();
  els["demo-progress"].max = DEMO_TOTAL_MS;
  try {
    if (window.__VLM_PLAYGROUND_SNAPSHOT__) {
      render(window.__VLM_PLAYGROUND_SNAPSHOT__);
      return;
    }
    const configuredSnapshotUrl = document.querySelector('meta[name="vlm-snapshot-url"]')?.content;
    const response = await fetch(configuredSnapshotUrl || "./data/snapshot.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`snapshot request failed: HTTP ${response.status}`);
    render(await response.json());
  } catch (error) {
    els["fatal-error"].hidden = false;
    text(els["fatal-error"], `Demo 无法启动：${error.message}`);
  }
}

window.addEventListener("DOMContentLoaded", init);
