const state = {
  snapshot: null,
  selectedIndex: 0,
  challenge: {
    round: 1,
    priority: null,
    sampleChoice: null,
    reason: null,
    completed: false,
  },
};

const els = {};

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
    "challenge-start",
    "priority-feedback",
    "priority-next",
    "sample-feedback",
    "sample-next",
    "reason-feedback",
    "finish-challenge",
    "challenge-complete",
    "challenge-reset",
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
    `六次真实 ${gpu} 训练已经完成。先用三轮挑战判断：覆盖更广、重复更少的数据，为什么没有赢？`,
  );
  els["hero-facts"].replaceChildren();
  ["1K 数据预算", "3 组配对种子", model, "ScienceQA"].forEach((fact) => {
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

function selectSingle(selector, selected) {
  document.querySelectorAll(selector).forEach((button) => {
    const active = button === selected;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setRound(round, focus = true) {
  state.challenge.round = round;
  state.challenge.completed = false;
  els["challenge-complete"].hidden = true;
  document.querySelectorAll("[data-round]").forEach((node) => {
    node.hidden = Number(node.dataset.round) !== round;
  });
  document.querySelectorAll("[data-round-progress]").forEach((node) => {
    const step = Number(node.dataset.roundProgress);
    node.classList.toggle("is-complete", step < round);
    if (step === round) node.setAttribute("aria-current", "step");
    else node.removeAttribute("aria-current");
  });
  if (focus) {
    document.querySelector(`[data-round="${round}"] button`)?.focus({ preventScroll: true });
  }
}

function resetChallenge() {
  state.challenge = {
    round: 1,
    priority: null,
    sampleChoice: null,
    reason: null,
    completed: false,
  };
  document.querySelectorAll("[data-priority], [data-sample-choice], [data-reason]").forEach((button) => {
    button.classList.remove("is-selected", "is-correct", "is-wrong");
    button.setAttribute("aria-pressed", "false");
  });
  text(els["priority-feedback"], "选择只记录你的判断，不生成预测分数。");
  text(els["sample-feedback"], "请选择一组，真实方法名和三随机种子均值会立即揭晓。");
  text(els["reason-feedback"], "选择一个解释，证据会告诉你哪些可以排除。");
  els["priority-next"].disabled = true;
  els["sample-next"].disabled = true;
  els["finish-challenge"].disabled = true;
  setRound(1, false);
  document.getElementById("budget-challenge")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
  window.setTimeout(() => document.querySelector("[data-priority]")?.focus(), 120);
}

function finishChallenge() {
  state.challenge.completed = true;
  document.querySelectorAll("[data-round]").forEach((node) => { node.hidden = true; });
  els["challenge-complete"].hidden = false;
  document.querySelectorAll("[data-round-progress]").forEach((node) => {
    node.classList.add("is-complete");
    node.removeAttribute("aria-current");
  });
  els["challenge-complete"].focus({ preventScroll: true });
}

function bindChallenge() {
  els["challenge-start"].addEventListener("click", () => {
    document.getElementById("budget-challenge")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => document.querySelector("[data-priority]")?.focus(), 180);
  });

  document.querySelectorAll("[data-priority]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      state.challenge.priority = button.dataset.priority;
      selectSingle("[data-priority]", button);
      const messages = {
        tail: "你把覆盖放在第一位。COINCIDE 的真实集合确实更接近这条原则。",
        duplicate: "你选择减少重复。真实 COINCIDE 集合也确实把近重复率从 66.0% 降到 52.3%。",
        distribution: "你选择守住高频科目。这个判断会在 1K 小预算下变得关键。",
      };
      text(els["priority-feedback"], messages[state.challenge.priority]);
      els["priority-next"].disabled = false;
    });
  });
  els["priority-next"].addEventListener("click", () => setRound(2));

  document.querySelectorAll("[data-sample-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      state.challenge.sampleChoice = button.dataset.sampleChoice;
      selectSingle("[data-sample-choice]", button);
      document.querySelectorAll("[data-sample-choice]").forEach((choice) => {
        choice.classList.toggle("is-correct", choice.dataset.sampleChoice === "A");
        choice.classList.toggle("is-wrong", choice === button && choice.dataset.sampleChoice !== "A");
      });
      const message = state.challenge.sampleChoice === "A"
        ? "你猜对了。A 是 Random-1000，真实均值 82.94%；B 是 COINCIDE-1000，真实均值 78.26%。"
        : "这是最自然的误判。B 更长尾、重复更少，但真实均值 78.26%，低于 A 的 82.94%。";
      text(els["sample-feedback"], message);
      els["sample-next"].disabled = false;
    });
  });
  els["sample-next"].addEventListener("click", () => setRound(3));

  document.querySelectorAll("[data-reason]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      state.challenge.reason = button.dataset.reason;
      selectSingle("[data-reason]", button);
      document.querySelectorAll("[data-reason]").forEach((choice) => {
        choice.classList.toggle("is-correct", choice.dataset.reason === "mismatch");
        choice.classList.toggle("is-wrong", choice === button && choice.dataset.reason !== "mismatch");
      });
      const messages = {
        duplicates: "可以排除：COINCIDE 的近重复率反而更低（52.3% 对 66.0%），并非因为重复更多。",
        broken: "可以排除：六次 1K 训练都完成 125 steps、checkpoint reload 与确定性评测。",
        mismatch: "这是当前证据支持的解释方向：1K 预算发生科目再分配，并可能存在 TinyLLaVA 选择表征到 Qwen 下游指标的迁移/目标错配；但尚未证明因果。",
      };
      text(els["reason-feedback"], messages[state.challenge.reason]);
      els["finish-challenge"].disabled = false;
    });
  });
  els["finish-challenge"].addEventListener("click", finishChallenge);
  els["challenge-reset"].addEventListener("click", resetChallenge);
}

function bindInteractions() {
  els["sample-select"].addEventListener("change", (event) => {
    renderSample(Number(event.target.value));
  });
  bindChallenge();
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
