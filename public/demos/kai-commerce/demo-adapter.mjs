import { MOCK_LABEL, SCENARIOS } from './state.mjs';

const PRODUCTS = Object.freeze([
  Object.freeze({ id: 'demo_perfume', name: '黑金淡香水', sku: 'KAI-PF-001', category: '美妆', imageUrl: null }),
  Object.freeze({ id: 'demo_coffee', name: '山场挂耳咖啡', sku: 'KAI-CF-018', category: '食品', imageUrl: null }),
  Object.freeze({ id: 'demo_speaker', name: '桌面蓝牙音箱', sku: 'KAI-3C-072', category: '3C', imageUrl: null })
]);

function mockOutput(task) {
  const topCandidates = [1, 2, 3].map(index => ({
    id: `${task.id}_c${index}`,
    imageUrl: null,
    width: 1024,
    height: 1024,
    realInference: false,
    mock: true,
    label: MOCK_LABEL,
    role: `演示候选 ${index}`
  }));
  const evaluations = Array.from({ length: 8 }, (_, index) => ({
    candidateId: index < 3 ? `${task.id}_c${index + 1}` : `${task.id}_hidden_${index + 1}`,
    hardFilter: index < 3
      ? { passed: null, reasons: [], checks: {} }
      : { passed: false, reasons: [index % 2 ? '演示夹具：商品边缘异常' : '演示夹具：包装文字不可验证'], checks: {} },
    scores: {
      imageReward: null,
      preference: null,
      aesthetic: null,
      promptAlignment: null,
      composition: null,
      commercialQuality: null
    },
    rankScore: null,
    rank: null
  }));
  return {
    requestId: task.request.requestId,
    status: 'completed',
    topCandidates,
    topCandidatesMode: 'mock_fixture_order_not_quality_ranked',
    evidenceStatus: 'mock',
    judge: {
      schemaVersion: 1,
      mode: 'mock',
      evaluations,
      selected: [],
      summary: { generated: 8, hardFilterPassed: null, selected: 0 }
    }
  };
}

export function createDemoWorkbenchApi() {
  const tasks = new Map();
  const history = [];
  const stages = ['retrieving', 'generating', 'judging', 'completed'];

  async function getGeneration(id) {
    const task = tasks.get(id);
    if (!task) throw new Error('演示任务不存在。');
    task.status = stages[Math.min(task.step, stages.length - 1)];
    task.step += 1;
    if (task.status === 'completed' && !task.output) {
      task.output = mockOutput(task);
      const product = PRODUCTS.find(item => item.id === task.request.productId);
      const scenario = SCENARIOS.find(item => item.intent === task.request.context.intent)
        || { label: task.request.context.intent };
      history.unshift({
        id: task.id,
        productName: product?.name,
        scenarioLabel: scenario.label,
        status: 'completed',
        createdAt: new Date().toISOString(),
        evidenceStatus: 'mock',
        selectedCount: 0
      });
    }
    return { generation: { id: task.id, status: task.status, output: task.output } };
  }

  return Object.freeze({
    async getConfig() {
      return {
        commercialVisualEngine: {
          mode: 'mock',
          runnable: true,
          useCases: SCENARIOS.map(scenario => scenario.id)
        }
      };
    },
    async listProducts() {
      return PRODUCTS;
    },
    async listHistory() {
      return history;
    },
    async startGeneration(request) {
      const task = { id: request.requestId, request, step: 0, status: 'directing', output: null };
      tasks.set(task.id, task);
      return { generation: { id: task.id, status: task.status } };
    },
    getGeneration,
    generationStatus: getGeneration,
    async selectCandidate(generationId, candidateId) {
      const task = tasks.get(generationId);
      if (!task?.output?.topCandidates.some(candidate => candidate.id === candidateId)) throw new Error('演示候选不存在。');
      const row = history.find(item => item.id === generationId);
      if (row) row.selectedCount = 1;
      return { selectedCandidateId: candidateId, evidenceStatus: 'mock' };
    }
  });
}
