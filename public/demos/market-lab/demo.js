const expectedBlockers = ['BLOCKED_IMPLEMENTATION_GATE', 'BLOCKED_NO_CUDA', 'BLOCKED_INTEGRATION_GATE'];
const positiveStates = new Set(['PROTOCOL_FROZEN', 'PASS_DATA_GATE', 'PASS_CPU_REPRODUCIBILITY', 'HELDOUT_UNCONSUMED']);
const labels = { lightgbm: 'LightGBM', mlplob: 'MLPLOB', deeplob: 'DeepLOB', tlob: 'TLOB' };

function allMetricsAreNull(models) {
  return models.every((model) => model.direction_consistency_count === null && Object.values(model.aggregate_metrics).every((value) => value === null));
}

function renderRows(models) {
  document.querySelector('#model-rows').innerHTML = models.map((model) => `<tr><td><strong>${labels[model.model_name] || model.model_name}</strong></td><td>${model.model_name === 'lightgbm' ? 'CPU BASELINE' : 'NEURAL CANDIDATE'}</td><td>${model.seed_count}</td><td>未运行</td><td>未运行</td><td>未运行</td><td>未运行</td><td>未运行</td><td>未运行</td><td><div class="state-stack">${model.gate_states.map((state) => `<span class="${positiveStates.has(state) ? 'positive' : ''}">${state}</span>`).join('')}</div></td></tr>`).join('');
}

try {
  const response = await fetch('./public_v2_summary.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  const summary = await response.json();
  const valid = summary.result_scope === 'PUBLIC_AGGREGATE_ONLY'
    && summary.final_verdict === 'INVALID_OR_BLOCKED'
    && summary.provenance?.source_scope === 'STATIC_NO_MODEL_DEMO'
    && summary.provenance?.source_report_sha256 === null
    && expectedBlockers.every((code) => summary.blocker_codes?.includes(code))
    && summary.models?.every((model) => model.gate_states?.includes('HELDOUT_UNCONSUMED'))
    && !summary.models?.some((model) => model.gate_states?.includes('HELDOUT_CONSUMED'))
    && allMetricsAreNull(summary.models || []);
  if (!valid) throw new Error('PUBLIC_SUMMARY_CONTRACT_REJECTED');
  renderRows(summary.models);
  document.querySelector('#scope').textContent = summary.result_scope;
  document.querySelector('#source-scope').textContent = summary.provenance.source_scope;
  document.querySelector('#code-commit').textContent = summary.provenance.code_commit;
  document.querySelector('#source-report').textContent = 'NULL / NOT ATTACHED';
  const status = document.querySelector('#contract-status');
  status.textContent = 'CONTRACT VERIFIED';
  status.style.color = 'var(--green)';
  status.style.borderColor = 'rgba(159,209,142,.42)';
} catch (error) {
  document.querySelector('#contract-status').textContent = 'FAIL CLOSED';
  document.querySelector('#model-rows').innerHTML = '<tr><td colspan="10">公开摘要未通过冻结契约；所有指标拒绝展示。</td></tr>';
  console.error('Market Lab public summary rejected:', error);
}
