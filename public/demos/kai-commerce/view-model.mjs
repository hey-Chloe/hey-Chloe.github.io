import { MOCK_LABEL, PIPELINE_STAGES, scenarioById, stageProgress, visibleCandidates } from './state.mjs?v=4.0-productization';

const MAX_TEXT = 240;

export function safeText(value, fallback = '') {
  const normalized = String(value == null ? fallback : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return normalized.slice(0, MAX_TEXT);
}

export function safeAssetUrl(value, base = 'https://kai.invalid/') {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value, base);
    if (url.protocol === 'https:' || url.protocol === 'http:' && new URL(base).protocol === 'http:' && url.origin === new URL(base).origin) {
      return url.href;
    }
    if (url.protocol === 'blob:') return url.href;
  } catch {
    return null;
  }
  return null;
}

export function pipelineView(status) {
  const progress = stageProgress(status);
  return PIPELINE_STAGES.map((stage, index) => ({
    ...stage,
    state: status === 'completed'
      ? 'complete'
      : status === 'error' && index === Math.max(progress - 1, 0)
      ? 'error'
      : index + 1 < progress ? 'complete' : index + 1 === progress ? 'active' : 'pending'
  }));
}

function evaluationFor(generation, candidateId) {
  const evaluations = generation?.judge?.evaluations;
  return Array.isArray(evaluations)
    ? evaluations.find(evaluation => evaluation?.candidateId === candidateId) || null
    : null;
}

export function candidateCards(generation, baseUrl) {
  const mode = generation?.topCandidatesMode;
  return visibleCandidates(generation).map((candidate, index) => {
    const evaluation = evaluationFor(generation, candidate.id);
    const hardFilter = evaluation?.hardFilter;
    const reasons = Array.isArray(hardFilter?.reasons)
      ? hardFilter.reasons.map(reason => safeText(reason)).filter(Boolean).slice(0, 5)
      : [];
    return {
      id: candidate.id,
      imageUrl: safeAssetUrl(candidate.imageUrl, baseUrl),
      alt: safeText(candidate.alt || candidate.role || `商品候选图 ${index + 1}`),
      role: safeText(candidate.role || `候选 ${index + 1}`),
      isMock: candidate.mock === true,
      mockLabel: candidate.mock === true ? MOCK_LABEL : null,
      displayOrder: index + 1,
      qualityRank: mode === 'judge_ranked' && Number.isInteger(evaluation?.rank) ? evaluation.rank : null,
      hardFilterPassed: typeof hardFilter?.passed === 'boolean' ? hardFilter.passed : null,
      reasons
    };
  });
}

export function rejectionSummary(generation) {
  const evaluations = Array.isArray(generation?.judge?.evaluations) ? generation.judge.evaluations : [];
  const rejected = evaluations.filter(evaluation => evaluation?.hardFilter?.passed === false);
  const counts = new Map();
  for (const evaluation of rejected) {
    for (const reason of evaluation.hardFilter.reasons || []) {
      const label = safeText(reason);
      if (label) counts.set(label, (counts.get(label) || 0) + 1);
    }
  }
  return {
    rejectedCount: rejected.length,
    reasons: [...counts.entries()].slice(0, 6).map(([label, count]) => ({ label, count }))
  };
}

export function resultHeading(generation) {
  if (generation?.topCandidatesMode === 'judge_ranked' && generation?.evidenceStatus === 'real') {
    return { title: '商业优选 Top 3', note: '仅展示通过硬性质检并获得真实评估证据的结果。', isMock: false };
  }
  if (generation?.topCandidatesMode === 'mock_fixture_order_not_quality_ranked' && generation?.evidenceStatus === 'mock') {
    return { title: '演示展示 3 张', note: '固定顺序仅用于验证界面编排，不代表质量排名或商业效果。', isMock: true };
  }
  return { title: '暂无可展示结果', note: '缺少可验证的评估证据，系统未生成质量排名。', isMock: false };
}

export function historyRows(history) {
  if (!Array.isArray(history)) return [];
  const statusLabels = { completed: '已完成', failed: '失败', error: '失败', queued: '排队中', pending: '等待中', running: '处理中', directing: '制定策略', retrieving: '检索参考', generating: '生成中', judging: '质检中' };
  return history.slice(0, 30).map(item => {
    const statusCode = safeText(item?.status || 'unknown').toLowerCase();
    return {
      id: safeText(item?.id || item?.requestId || '未知任务'),
      productName: safeText(item?.productName || '未命名商品'),
      scenarioLabel: safeText(item?.scenarioLabel || scenarioById(item?.scenarioId)?.label || '未知场景'),
      status: statusLabels[statusCode] || '状态未知',
      statusCode,
      createdAt: safeText(item?.createdAt || ''),
      selectedCount: Number.isInteger(item?.selectedCount) ? Math.max(0, Math.min(item.selectedCount, 3)) : 0,
      isMock: item?.evidenceStatus === 'mock'
    };
  });
}
