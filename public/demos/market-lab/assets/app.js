const steps = [
  ['01 · 读取历史订单簿', '模型只看过去，不看未来', '窗口按交易日边界构建，避免未来信息穿越到模型输入。', '输入边界已说明'],
  ['02 · 运行方向预测', '输出上涨、平稳、下跌三类概率', '公开版不携带逐样本概率；真实回放只保留在本地私有演示环境。', '逐样本结果未公开'],
  ['03 · 映射交易信号', '把模型类别映射为做多、空仓或做空', '映射规则属于研究界面逻辑，不代表真实订单，也不构成投资建议。', '交易动作仅作结构示意'],
  ['04 · 验证与失败分析', '用未见验证日检查模型，而不是展示漂亮样本', '模型指标、逐样本预测与收益序列未进入公开包；密封测试集保持未使用。', '公开版不展示私有指标'],
];

const expectedBlockers = ['BLOCKED_IMPLEMENTATION_GATE', 'BLOCKED_NO_CUDA', 'BLOCKED_INTEGRATION_GATE'];
const publicModelNames = new Set(['lightgbm', 'mlplob', 'deeplob', 'tlob']);

const allMetricsAreNull = (models) => models.every((model) => (
  model.direction_consistency_count === null
  && model.aggregate_metrics
  && Object.values(model.aggregate_metrics).every((value) => value === null)
));

const isValidPublicSummary = (summary) => {
  const models = Array.isArray(summary.models) ? summary.models : [];
  return summary.result_scope === 'PUBLIC_AGGREGATE_ONLY'
    && summary.final_verdict === 'INVALID_OR_BLOCKED'
    && summary.provenance?.source_scope === 'STATIC_NO_MODEL_DEMO'
    && summary.provenance?.source_report_sha256 === null
    && expectedBlockers.every((code) => summary.blocker_codes?.includes(code))
    && models.length === publicModelNames.size
    && new Set(models.map((model) => model.model_name)).size === publicModelNames.size
    && models.every((model) => publicModelNames.has(model.model_name))
    && models.every((model) => model.seed_count === 5)
    && models.every((model) => model.gate_states?.includes('HELDOUT_UNCONSUMED'))
    && !models.some((model) => model.gate_states?.includes('HELDOUT_CONSUMED'))
    && allMetricsAreNull(models);
};

const lob = document.querySelector('#lob-visual');
for (let index = 0; index < 1000; index += 1) {
  const cell = document.createElement('i');
  cell.className = index % 4 < 2 ? 'ask' : 'bid';
  cell.style.opacity = String(0.2 + ((index * 17) % 55) / 100);
  cell.style.animationDelay = `${(index % 50) * 8}ms`;
  lob.appendChild(cell);
}

const flowButtons = [...document.querySelectorAll('[data-step]')];
const renderStep = (index) => {
  flowButtons.forEach((button, buttonIndex) => button.classList.toggle('active', buttonIndex === index));
  document.querySelector('#step-label').textContent = steps[index][0];
  document.querySelector('#step-title').textContent = steps[index][1];
  document.querySelector('#step-copy').textContent = steps[index][2];
  document.querySelector('#decision-result').textContent = steps[index][3];
  lob.classList.remove('playing');
  window.requestAnimationFrame(() => lob.classList.add('playing'));
};

flowButtons.forEach((button) => button.addEventListener('click', () => renderStep(Number(button.dataset.step))));
document.querySelector('#play-demo').addEventListener('click', () => {
  let index = 0;
  renderStep(index);
  document.querySelector('.demo-section').scrollIntoView({behavior: 'smooth', block: 'start'});
  const timer = window.setInterval(() => {
    index += 1;
    if (index >= steps.length) return window.clearInterval(timer);
    renderStep(index);
  }, 1100);
});

const statusText = (gates) => gates.includes('BLOCKED_NO_CUDA') ? '等待 CUDA 完整评估' : gates.includes('BLOCKED_INTEGRATION_GATE') ? '公开结果未发布' : '状态已记录';
fetch('data/public_v2_summary.json', {cache: 'no-store'})
  .then((response) => {
    if (!response.ok) throw new Error('公开摘要不可用');
    return response.json();
  })
  .then((summary) => {
    if (!isValidPublicSummary(summary)) throw new Error('公开摘要未通过冻结契约');
    const labels = {lightgbm: 'LightGBM', mlplob: 'MLPLOB', deeplob: 'DeepLOB', tlob: 'TLOB'};
    document.querySelector('#model-grid').innerHTML = summary.models.map((model) => `<article class="model-card"><div><span>模型</span><h3>${labels[model.model_name] || '未命名模型'}</h3><p>${model.model_name === 'lightgbm' ? '梯度提升决策树基线' : '深度时序方向预测模型'}</p></div><b class="model-status">${statusText(model.gate_states)}</b><dl><div><dt>固定 Seed</dt><dd>${model.seed_count}</dd></div><div><dt>公开性能指标</dt><dd>未发布</dd></div></dl></article>`).join('');
  })
  .catch((error) => {
    document.querySelector('#model-grid').innerHTML = `<p class="loading">${error.message}；已安全阻断，不显示模型结果。</p>`;
  });
