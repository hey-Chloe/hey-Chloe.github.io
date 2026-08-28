const state = {
  fixture: null,
  retrievalReport: null,
  ctrReport: null,
  positionReport: null,
  history: 0,
  retrievalModel: "itemKnn",
  retrievalMode: "exact",
  ctrModel: "deepfm",
  positionMethod: "naive_bts",
  clipping: "none",
  rankingRound: 0,
  rankingSelection: [],
  rankingSubmitted: false,
};

const $ = (selector) => document.querySelector(selector);
const labels = {
  popularity: "热门召回",
  itemKnn: "相似商品召回",
  bprMf: "矩阵分解",
  twoTower: "双塔召回",
  logistic_regression: "逻辑回归",
  deepfm: "深度因子分解机",
  dcnv2: "深度交叉网络",
  naive_bts: "直接统计",
  ips: "逆倾向加权",
  snips: "归一化逆倾向加权",
};

function number(value, digits = 4) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function integer(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value);
}

function renderButtons(selector, options, selected, onChange, disabled = false) {
  const root = $(selector);
  root.replaceChildren();
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.disabled = disabled;
    button.setAttribute("aria-pressed", String(option.id === selected));
    button.addEventListener("click", () => onChange(option.id));
    root.append(button);
  });
}

function renderMetrics(selector, metrics) {
  const root = $(selector);
  root.replaceChildren();
  metrics.forEach((metric) => {
    const cell = document.createElement("div");
    cell.className = "metric-cell";
    const label = document.createElement("span");
    label.className = "metric-label";
    label.textContent = metric.label;
    const value = document.createElement("strong");
    value.className = "metric-value";
    value.textContent = metric.integer ? integer(metric.value) : number(metric.value, metric.digits ?? 4);
    cell.append(label, value);
    if (metric.std !== undefined) {
      const std = document.createElement("span");
      std.className = "metric-std";
      std.textContent = `标准差 · ${number(metric.std, metric.digits ?? 4)}`;
      cell.append(std);
    }
    root.append(cell);
  });
}

function status(selector, value, kind = "complete") {
  const node = $(selector);
  node.textContent = value;
  node.dataset.state = kind;
}

function retrievalSummary() {
  const models = state.retrievalReport.results.models;
  return state.retrievalModel === "twoTower"
    ? models.twoTower.exactSummary
    : models[state.retrievalModel].summary;
}

function retrievalControls() {
  renderButtons(
    "#retrieval-histories",
    state.fixture.amazon.histories.map((_, index) => ({ id: index, label: `样例 ${String.fromCharCode(65 + index)}` })),
    state.history,
    (id) => {
      state.history = id;
      renderRetrieval(false);
    },
  );
  renderButtons(
    "#retrieval-models",
    ["popularity", "itemKnn", "bprMf", "twoTower"].map((id) => ({ id, label: labels[id] })),
    state.retrievalModel,
    (id) => {
      state.retrievalModel = id;
      if (id !== "twoTower") state.retrievalMode = "exact";
      renderRetrieval(false);
    },
  );
  renderButtons(
    "#retrieval-modes",
    [
      { id: "exact", label: "精确检索" },
      { id: "ann", label: "近似检索" },
    ],
    state.retrievalMode,
    (id) => {
      state.retrievalMode = id;
      renderRetrieval(false);
    },
    state.retrievalModel !== "twoTower",
  );
}

function renderRetrieval(run = false) {
  retrievalControls();
  const counts = state.retrievalReport.protocol.counts;
  $("#pipeline-catalog").textContent = `${integer(counts.trainCatalogItems)} 件商品`;
  $("#retrieval-catalog").textContent = `${integer(counts.trainCatalogItems)} 件商品`;
  $("#retrieval-cohort").textContent = `${integer(counts.testEvaluationUsers)} 名共同测试用户`;

  const history = state.fixture.amazon.histories[state.history];
  const tokens = $("#retrieval-history");
  tokens.replaceChildren();
  history.history.forEach((item) => {
    const token = document.createElement("span");
    token.textContent = item;
    tokens.append(token);
  });
  $("#retrieval-target").textContent = history.actualNextItem;

  const summary = retrievalSummary();
  renderMetrics("#retrieval-metrics", [
    { label: "召回率 Recall@20", value: summary["20"].recall.mean },
    { label: "召回率 Recall@50", value: summary["50"].recall.mean },
    { label: "召回率 Recall@100", value: summary["100"].recall.mean },
    { label: "首个命中排名 MRR@100", value: summary["100"].mrr.mean },
    { label: "排序质量 NDCG@100", value: summary["100"].ndcg.mean },
  ]);

  const annRoot = $("#retrieval-ann");
  const showAnn = state.retrievalModel === "twoTower" && state.retrievalMode === "ann";
  annRoot.hidden = !showAnn;
  if (showAnn) {
    const ann = state.retrievalReport.results.models.twoTower.annSummary;
    annRoot.replaceChildren();
    [
      ["近似检索覆盖率@100", ann.annRecall["100"].mean, 4, ""],
      ["一半请求耗时 p50", ann.p50LatencyMs.mean, 3, " 毫秒"],
      ["95% 请求耗时 p95", ann.p95LatencyMs.mean, 3, " 毫秒"],
      ["每秒查询数 QPS", ann.qps.mean, 0, ""],
    ].forEach((metric) => {
      const node = document.createElement("div");
      const label = document.createElement("span");
      label.textContent = metric[0];
      const value = document.createElement("strong");
      value.textContent = `${number(metric[1], metric[2])}${metric[3]}`;
      node.append(label, value);
      annRoot.append(node);
    });
  }

  const list = $("#retrieval-results");
  const blocked = $("#retrieval-blocked");
  list.replaceChildren();
  const retrievalModeLabel = state.retrievalMode === "ann" ? "近似检索" : "精确检索";
  $("#retrieval-result-kind").textContent = `${labels[state.retrievalModel]} · ${retrievalModeLabel}`;

  if (!run) {
    blocked.hidden = false;
    blocked.textContent = "概念推荐会在这里出现。交互列表是合成样例，真实聚合指标留在技术细节中。";
    status("#retrieval-run-state", "选择合成历史后，点击按钮查看概念推荐。", "ready");
    return;
  }

  const results = history.recommendations[state.retrievalModel];
  if (!results) {
    blocked.hidden = false;
    blocked.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = "缺少可回放记录";
    const detail = document.createElement("span");
    detail.textContent = "这个模型有冻结的聚合基准指标，但没有保存用户级模型检查点和前 10 个结果。为避免伪造，这里不生成替代推荐。";
    blocked.append(title, detail);
    status("#retrieval-run-state", `${labels[state.retrievalModel]}：只有冻结聚合指标，无法为当前合成历史生成推荐。`, "not-run");
    return;
  }

  blocked.hidden = true;
  results.forEach((item) => {
    const row = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = item;
    const source = document.createElement("span");
    source.textContent = "合成概念样例";
    row.append(name, source);
    list.append(row);
  });
  status("#retrieval-run-state", `完成：已展示 ${labels[state.retrievalModel]} 的 10 个合成概念结果。`, "complete");
}

function calibrationBucket(model, seed) {
  const run = state.ctrReport.results.runs.find(
    (candidate) => candidate.model === model && candidate.seed === seed,
  );
  return run.testMetrics.calibration.find(
    (bucket) => bucket.count > 0 && bucket.meanPrediction !== null,
  );
}

function renderCtr(run = false) {
  renderButtons(
    "#ctr-models",
    ["logistic_regression", "deepfm", "dcnv2"].map((id) => ({ id, label: labels[id] })),
    state.ctrModel,
    (id) => {
      state.ctrModel = id;
      renderCtr(false);
    },
  );

  const counts = state.ctrReport.protocol.counts;
  $("#ctr-split").textContent = `${integer(counts.trainRows)} / ${integer(counts.devRows)} / ${integer(counts.testRows)}`;
  $("#ctr-feature-counts").textContent = `${integer(counts.numericFeatures)} 个数值特征 · ${integer(counts.categoricalFeatures)} 个类别特征`;

  const fixture = state.fixture.criteo;
  $("#ctr-row-alias").textContent = fixture.rowAlias;
  const featureRoot = $("#ctr-features");
  featureRoot.replaceChildren();
  fixture.features.forEach((feature) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = feature.name;
    const value = document.createElement("dd");
    value.textContent = feature.value;
    row.append(term, value);
    featureRoot.append(row);
  });

  const metrics = state.ctrReport.results.summary[state.ctrModel];
  renderMetrics("#ctr-metrics", [
    { label: "排序区分能力 ROC-AUC", value: metrics.rocAuc.mean, std: metrics.rocAuc.std },
    { label: "正样本区分能力 PR-AUC", value: metrics.prAuc.mean, std: metrics.prAuc.std },
    { label: "概率损失 LogLoss ↓", value: metrics.logLoss.mean, std: metrics.logLoss.std },
    { label: "概率误差 Brier ↓", value: metrics.brierScore.mean, std: metrics.brierScore.std },
    { label: "校准误差 ECE ↓", value: metrics.ece.mean, std: metrics.ece.std },
  ]);

  const seed = state.ctrReport.protocol.seeds[0];
  const bucket = calibrationBucket(state.ctrModel, seed);
  $("#ctr-probability").textContent = run ? `${number(bucket.meanPrediction * 100, 2)}%` : "—";
  $("#ctr-probability-range").textContent = run
    ? `${labels[state.ctrModel]} · 概率校准区间 [${number(bucket.lower, 1)}, ${number(bucket.upper, 1)}) · 样本数 ${integer(bucket.count)}`
    : "点击按钮读取冻结结果";
  status(
    "#ctr-run-state",
    run
      ? `完成：展示 ${labels[state.ctrModel]} 的冻结概率校准分组均值，不是单样本点击率。`
      : "选择模型后查看公开离线结果。",
    run ? "complete" : "ready",
  );
}

function positionKey() {
  if (state.positionMethod === "naive_bts") return "naive_bts";
  return state.clipping === "none"
    ? state.positionMethod
    : `${state.positionMethod}_clipped_${state.clipping}`;
}

function renderPosition(run = false) {
  renderButtons(
    "#position-methods",
    [
      { id: "naive_bts", label: "直接统计" },
      { id: "ips", label: "逆倾向加权" },
      { id: "snips", label: "归一化加权" },
    ],
    state.positionMethod,
    (id) => {
      state.positionMethod = id;
      if (id === "naive_bts") state.clipping = "none";
      renderPosition(false);
    },
  );
  renderButtons(
    "#position-clipping",
    [
      { id: "none", label: "不截断" },
      { id: "0p01", label: "0.01" },
      { id: "0p02", label: "0.02" },
      { id: "0p05", label: "0.05" },
      { id: "0p1", label: "0.10" },
    ],
    state.clipping,
    (id) => {
      state.clipping = id;
      renderPosition(false);
    },
    state.positionMethod === "naive_bts",
  );

  const counts = state.positionReport.protocol.counts;
  $("#position-bts").textContent = `${integer(counts.btsTestRows)} 行 · ${integer(counts.btsTestClicks)} 次点击`;
  $("#position-random").textContent = `${integer(counts.randomTestRows)} 行 · ${integer(counts.randomTestClicks)} 次点击`;
  const all = state.positionReport.results.policyValueEstimates;
  $("#position-reference").textContent = `随机策略实测 · ${number(all.on_policy_random.estimate, 6)}`;
  const result = all[positionKey()];

  renderMetrics("#position-primary-metrics", [
    { label: "估计结果", value: run ? result.estimate : null, digits: 6 },
    { label: "与随机实验的误差 ↓", value: run ? result.absoluteErrorToOnPolicy : null, digits: 6 },
  ]);
  renderMetrics("#position-technical-metrics", [
    { label: "有效样本量（ESS）", value: run ? result.effectiveSampleSize : null, integer: true },
    { label: "权重方差", value: run ? result.weightVariance : null, digits: 4 },
  ]);
  status(
    "#position-run-state",
    run
      ? `完成：${labels[state.positionMethod]} 的冻结实验结果已加载。`
      : "选择方法后读取冻结实验记录。",
    run ? "complete" : "ready",
  );
}

function currentRankingRound() {
  return state.fixture.rankingGame.rounds[state.rankingRound];
}

function rankingItem(itemId) {
  return currentRankingRound().candidates.find((candidate) => candidate.id === itemId);
}

function selectRankingItem(itemId) {
  if (state.rankingSubmitted) return;
  const result = RankingGameCore.toggleSelection(state.rankingSelection, itemId, 3);
  if (!result.changed) {
    $("#ranking-hint").textContent = "Top-3 已满。先移除一件，再加入新的候选。";
    $("#ranking-hint").dataset.state = "notice";
    return;
  }
  state.rankingSelection = result.selection;
  renderRankingGame();
  requestAnimationFrame(() => {
    document.querySelector(`[data-candidate-id="${itemId}"]`)?.focus();
  });
}

function moveRankingItem(itemId, direction) {
  if (state.rankingSubmitted) return;
  state.rankingSelection = RankingGameCore.moveRanking(state.rankingSelection, itemId, direction);
  renderRankingGame();
  requestAnimationFrame(() => {
    document.querySelector(`[data-rank-item="${itemId}"] [data-move="${direction}"]`)?.focus();
  });
}

function removeRankingItem(itemId) {
  if (state.rankingSubmitted) return;
  state.rankingSelection = state.rankingSelection.filter((id) => id !== itemId);
  renderRankingGame();
  requestAnimationFrame(() => {
    document.querySelector(`[data-candidate-id="${itemId}"]`)?.focus();
  });
}

function renderRankingSlots() {
  const root = $("#ranking-slots");
  root.replaceChildren();
  [0, 1, 2].forEach((index) => {
    const slot = document.createElement("li");
    slot.className = "ranking-slot";
    const rank = document.createElement("span");
    rank.className = "ranking-slot__rank";
    rank.textContent = `0${index + 1}`;
    slot.append(rank);

    const itemId = state.rankingSelection[index];
    if (!itemId) {
      const empty = document.createElement("span");
      empty.className = "ranking-slot__empty";
      empty.textContent = index === 0 ? "先选最值得推荐的商品" : "等待选择";
      slot.append(empty);
      root.append(slot);
      return;
    }

    const item = rankingItem(itemId);
    slot.dataset.rankItem = itemId;
    const copy = document.createElement("span");
    copy.className = "ranking-slot__copy";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const cue = document.createElement("small");
    cue.textContent = item.cue;
    copy.append(name, cue);

    const controls = document.createElement("span");
    controls.className = "ranking-slot__controls";
    [
      { label: "上移", direction: -1, disabled: index === 0 },
      { label: "下移", direction: 1, disabled: index === state.rankingSelection.length - 1 },
    ].forEach((control) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = control.label;
      button.dataset.move = String(control.direction);
      button.disabled = state.rankingSubmitted || control.disabled;
      button.setAttribute("aria-label", `${item.name}${control.label}`);
      button.addEventListener("click", () => moveRankingItem(itemId, control.direction));
      controls.append(button);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "移除";
    remove.disabled = state.rankingSubmitted;
    remove.setAttribute("aria-label", `从排名中移除${item.name}`);
    remove.addEventListener("click", () => removeRankingItem(itemId));
    controls.append(remove);

    slot.append(copy, controls);
    root.append(slot);
  });
}

function renderRankingCandidates() {
  const root = $("#ranking-candidates");
  root.replaceChildren();
  currentRankingRound().candidates.forEach((candidate) => {
    const selectedIndex = state.rankingSelection.indexOf(candidate.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ranking-candidate";
    button.dataset.candidateId = candidate.id;
    button.disabled = state.rankingSubmitted;
    button.setAttribute("aria-pressed", String(selectedIndex >= 0));
    button.setAttribute(
      "aria-label",
      selectedIndex >= 0
        ? `${candidate.name}，当前第 ${selectedIndex + 1} 名，点击移除`
        : `${candidate.name}，${candidate.cue}，点击加入下一名`,
    );
    const name = document.createElement("strong");
    name.textContent = candidate.name;
    const cue = document.createElement("span");
    cue.textContent = selectedIndex >= 0 ? `已选 · 第 ${selectedIndex + 1} 名` : candidate.cue;
    button.append(name, cue);
    button.addEventListener("click", () => selectRankingItem(candidate.id));
    root.append(button);
  });
}

function renderRankingGame() {
  const round = currentRankingRound();
  $("#rank-game-round").textContent = `第 ${state.rankingRound + 1} / ${state.fixture.rankingGame.rounds.length} 轮`;
  $("#ranking-user-title").textContent = round.user;
  $("#ranking-mission").textContent = round.mission;

  const signals = $("#ranking-signals");
  signals.replaceChildren();
  round.signals.forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    signals.append(item);
  });

  renderRankingSlots();
  renderRankingCandidates();
  $("#ranking-count").textContent = `已选 ${state.rankingSelection.length} / 3`;
  $("#ranking-submit").disabled = state.rankingSelection.length !== 3 || state.rankingSubmitted;
  $("#ranking-reset").disabled = state.rankingSelection.length === 0 && !state.rankingSubmitted;
  $("#ranking-hint").textContent = state.rankingSubmitted
    ? "本轮已提交。可以查看原因、再排一次，或换一位模拟用户。"
    : state.rankingSelection.length === 3
      ? "Top-3 已排好。还可以调整顺序，然后提交。"
      : "点击候选加入排名；选中后可上移、下移或移除。所有得分只用于这局教学模拟。";
  $("#ranking-hint").dataset.state = state.rankingSelection.length === 3 ? "ready" : "";
}

function submitRankingGame() {
  if (state.rankingSelection.length !== 3 || state.rankingSubmitted) return;
  const round = currentRankingRound();
  state.rankingSubmitted = true;
  const { hits, exact } = RankingGameCore.evaluateRanking(state.rankingSelection, round.idealOrder);

  const title = exact === 3
    ? "三件都排对了"
    : hits === 3
      ? "选对了三件，再看看顺序"
      : hits >= 1
        ? "抓到了一部分偏好"
        : "热门不等于相关";
  $("#ranking-feedback-title").textContent = title;
  $("#ranking-score").textContent = `教学模拟结果：候选命中 ${hits} / 3，顺序命中 ${exact} / 3。`;

  const list = $("#ranking-feedback-list");
  list.replaceChildren();
  state.rankingSelection.forEach((itemId, index) => {
    const item = rankingItem(itemId);
    const row = document.createElement("li");
    row.dataset.result = round.idealOrder.includes(itemId) ? "hit" : "miss";
    const rank = document.createElement("span");
    rank.textContent = `0${index + 1}`;
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = item.name;
    const reason = document.createElement("small");
    reason.textContent = item.feedback;
    copy.append(name, reason);
    row.append(rank, copy);
    list.append(row);
  });

  $("#ranking-answer-order").textContent = round.idealOrder
    .map((itemId, index) => `${index + 1}. ${rankingItem(itemId).name}`)
    .join("　");
  $("#ranking-feedback").hidden = false;
  renderRankingGame();
  requestAnimationFrame(() => $("#ranking-feedback").focus());
}

function resetRankingGame() {
  state.rankingSelection = [];
  state.rankingSubmitted = false;
  $("#ranking-feedback").hidden = true;
  renderRankingGame();
  requestAnimationFrame(() => $("#ranking-candidates button")?.focus());
}

function nextRankingRound() {
  state.rankingRound = (state.rankingRound + 1) % state.fixture.rankingGame.rounds.length;
  resetRankingGame();
  requestAnimationFrame(() => $("#ranking-user-title").focus?.());
}

async function initialize() {
  try {
    const reportBase = document.documentElement.dataset.reportBase || "../reports";
    const responses = await Promise.all([
      fetch("./data/demo-fixtures.json"),
      fetch(`${reportBase}/amazon-retrieval-v1-results.json`),
      fetch(`${reportBase}/criteo-ctr-v1-results.json`),
      fetch(`${reportBase}/position-bias-open-bandit-full-ope-v1.json`),
    ]);
    if (!responses.every((response) => response.ok)) {
      throw new Error("one or more local artifacts could not be loaded");
    }
    [state.fixture, state.retrievalReport, state.ctrReport, state.positionReport] = await Promise.all(
      responses.map((response) => response.json()),
    );
    renderRankingGame();
    renderRetrieval();
    renderCtr();
    renderPosition();

    $("#retrieval-run").addEventListener("click", () => renderRetrieval(true));
    $("#ctr-run").addEventListener("click", () => renderCtr(true));
    $("#position-run").addEventListener("click", () => renderPosition(true));
    $("#ranking-submit").addEventListener("click", submitRankingGame);
    $("#ranking-reset").addEventListener("click", resetRankingGame);
    $("#ranking-next").addEventListener("click", nextRankingRound);
    $("#open-technical-details").addEventListener("click", () => {
      const details = $("#position-details");
      details.open = true;
      details.querySelector("summary").focus();
      $("#open-technical-details").textContent = "技术细节已打开";
    });
  } catch (error) {
    console.error(error);
    $("#load-error").hidden = false;
  }
}

initialize();
