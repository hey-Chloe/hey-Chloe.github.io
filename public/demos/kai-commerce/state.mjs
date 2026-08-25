const MOCK_LABEL = 'MOCK / NOT REAL AI OUTPUT';

export const SCENARIOS = Object.freeze([
  Object.freeze({
    id: 'taobao_main',
    label: '淘宝主图',
    description: '清晰主体、极简背景，优先信息效率',
    platform: 'taobao',
    intent: 'minimal_main_image'
  }),
  Object.freeze({
    id: 'xiaohongshu_seed',
    label: '小红书种草图',
    description: '生活方式场景，保留商品真实感',
    platform: 'xiaohongshu',
    intent: 'xiaohongshu_seeding'
  }),
  Object.freeze({
    id: 'douyin_cover',
    label: '抖音商品封面',
    description: '高对比视觉钩子，适配竖屏浏览',
    platform: 'douyin',
    intent: 'high_contrast_hook'
  }),
  Object.freeze({
    id: 'scene_product',
    label: '场景商品图',
    description: '把商品放入真实使用环境，强调用途与氛围',
    platform: 'independent_store',
    intent: 'lifestyle_scene'
  }),
  Object.freeze({
    id: 'premium_brand',
    label: '高级品牌图',
    description: '克制构图与材质光影，强化品牌感',
    platform: 'brand_owned',
    intent: 'premium_brand'
  }),
  Object.freeze({
    id: 'promotion',
    label: '促销广告图',
    description: '强层级与活动氛围，避免伪造商品文字',
    platform: 'commerce_campaign',
    intent: 'promotion'
  })
]);

export const PIPELINE_STAGES = Object.freeze([
  Object.freeze({ id: 'directing', label: '视觉策略' }),
  Object.freeze({ id: 'retrieving', label: '参考检索' }),
  Object.freeze({ id: 'generating', label: '生成 8 张' }),
  Object.freeze({ id: 'judging', label: '商业质检' }),
  Object.freeze({ id: 'completed', label: '展示 3 张' })
]);

const VALID_STAGES = new Set(['idle', ...PIPELINE_STAGES.map(stage => stage.id), 'error']);
const STATIC_FOCUS_KEYS = new Set([
  'back-link',
  'product-select',
  'generation-submit',
  'results-heading',
  'login-recovery',
  'upload-recovery'
]);
const DYNAMIC_FOCUS_KINDS = new Set(['scenario', 'candidate', 'save', 'decision', 'history']);
const SAFE_FOCUS_ID = /^[A-Za-z0-9_-]{1,160}$/;

export function scenarioById(scenarioId) {
  return SCENARIOS.find(scenario => scenario.id === scenarioId) || null;
}

export function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];
  return products
    .filter(product => product && typeof product.id === 'string' && product.id.length > 0)
    .slice(0, 500)
    .map(product => ({
      id: product.id.slice(0, 128),
      name: String(product.name || '未命名商品').slice(0, 100),
      sku: product.sku == null ? null : String(product.sku).slice(0, 64),
      category: product.category == null ? null : String(product.category).slice(0, 64),
      imageUrl: product.imageUrl == null ? null : String(product.imageUrl)
    }));
}

export function createInitialState({ products = [], history = [] } = {}) {
  const normalizedProducts = normalizeProducts(products);
  return {
    status: 'idle',
    engine: {
      loading: true,
      mode: 'unknown',
      runnable: false,
      message: '正在检查商业视觉引擎可用性…',
      useCases: []
    },
    products: normalizedProducts,
    productsLoaded: normalizedProducts.length > 0,
    history: Array.isArray(history) ? history.slice(0, 100) : [],
    historyLoaded: Array.isArray(history) && history.length > 0,
    selectedProductId: normalizedProducts[0]?.id || null,
    selectedScenarioId: SCENARIOS[0].id,
    generation: null,
    selectedCandidateId: null,
    savedAssets: [],
    savingCandidateId: null,
    account: {
      plan: 'TRIAL',
      balance: null,
      entries: []
    },
    openingHistoryId: null,
    message: null,
    error: null,
    errorCode: null,
    errorStatus: null,
    selectionError: null,
    selectionErrorCode: null,
    selectionErrorStatus: null,
    assetSaveError: null,
    assetSaveErrorCode: null,
    assetSaveErrorStatus: null,
    historyError: null,
    historyErrorCode: null,
    historyErrorStatus: null
  };
}

export function engineAvailabilityFromConfig(config) {
  const engine = config?.commercialVisualEngine;
  const mode = ['mock', 'real', 'disabled'].includes(engine?.mode) ? engine.mode : 'unknown';
  const runnable = engine?.runnable === true;
  const useCases = Array.isArray(engine?.useCases)
    ? engine.useCases.filter(value => typeof value === 'string').slice(0, 20)
    : [];

  if (runnable && mode === 'mock') {
    return {
      loading: false,
      mode,
      runnable: true,
      message: `${MOCK_LABEL}。仅用于开发验收，不执行真实推理或质量排名。`,
      useCases
    };
  }
  if (runnable && mode === 'real') {
    return {
      loading: false,
      mode,
      runnable: true,
      message: '商业视觉引擎已就绪，可开始真实生成与质检。',
      useCases
    };
  }
  if (mode === 'disabled') {
    return {
      loading: false,
      mode,
      runnable: false,
      message: '商业视觉引擎当前未启用。可查看历史，暂不能开始新任务。',
      useCases
    };
  }
  if (mode === 'real') {
    return {
      loading: false,
      mode,
      runnable: false,
      message: '真实生成与质检服务尚未配置完成。可查看历史，暂不能开始新任务。',
      useCases
    };
  }
  return {
    loading: false,
    mode: 'unknown',
    runnable: false,
    message: '无法确认商业视觉引擎状态。为避免误生成，已暂时停用新任务。',
    useCases
  };
}

export function focusKey(kind, id) {
  if (STATIC_FOCUS_KEYS.has(kind) && id == null) return kind;
  if (DYNAMIC_FOCUS_KINDS.has(kind) && SAFE_FOCUS_ID.test(String(id || ''))) return `${kind}:${id}`;
  return null;
}

export function captureFocusKey(root, activeElement) {
  if (!root || !activeElement || typeof root.contains !== 'function' || !root.contains(activeElement)) return null;
  const key = activeElement.dataset?.focusKey;
  return typeof key === 'string' && key.length <= 180 ? key : null;
}

export function restoreFocusKey(root, key) {
  if (!root || typeof key !== 'string' || typeof root.querySelectorAll !== 'function') return false;
  for (const node of root.querySelectorAll('[data-focus-key]')) {
    if (node?.dataset?.focusKey !== key || node.disabled === true || typeof node.focus !== 'function') continue;
    node.focus({ preventScroll: true });
    return true;
  }
  return false;
}

export function buildGenerationRequest({ products, selectedProductId, selectedScenarioId, requestId }) {
  const product = normalizeProducts(products).find(item => item.id === selectedProductId);
  if (!product) throw new Error('请先选择已上传的商品。');
  const scenario = scenarioById(selectedScenarioId);
  if (!scenario) throw new Error('请选择有效的使用场景。');
  if (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(requestId)) {
    throw new Error('请求标识无效。');
  }

  return {
    requestId,
    productId: product.id,
    context: {
      platform: scenario.platform,
      intent: scenario.intent
    },
    candidateCount: 8,
    topK: 3
  };
}

export function visibleCandidates(generation) {
  if (!generation || !Array.isArray(generation.topCandidates)) return [];
  const candidates = generation.topCandidates.filter(candidate => candidate && typeof candidate.id === 'string');

  if (generation.topCandidatesMode === 'judge_ranked' && generation.evidenceStatus === 'real') {
    return candidates.slice(0, 3);
  }

  const isValidMock = generation.topCandidatesMode === 'mock_fixture_order_not_quality_ranked'
    && generation.evidenceStatus === 'mock'
    && candidates.every(candidate => candidate.mock === true && candidate.realInference === false && candidate.label === MOCK_LABEL);
  return isValidMock ? candidates.slice(0, 3) : [];
}

export function stageProgress(status) {
  if (status === 'idle' || status === 'error') return status === 'error' ? -1 : 0;
  const index = PIPELINE_STAGES.findIndex(stage => stage.id === status);
  return index < 0 ? 0 : index + 1;
}

export function workbenchReducer(state, action) {
  switch (action?.type) {
    case 'products_loaded': {
      const products = normalizeProducts(action.products);
      return {
        ...state,
        products,
        productsLoaded: true,
        selectedProductId: products.some(product => product.id === state.selectedProductId)
          ? state.selectedProductId
          : products[0]?.id || null,
        error: null,
        errorCode: null,
        errorStatus: null
      };
    }
    case 'history_loaded':
      return {
        ...state,
        history: Array.isArray(action.history) ? action.history.slice(0, 100) : [],
        historyLoaded: true,
        historyError: null,
        historyErrorCode: null,
        historyErrorStatus: null
      };
    case 'engine_config_loaded':
      return { ...state, engine: engineAvailabilityFromConfig(action.config) };
    case 'engine_config_failed':
      return {
        ...state,
        engine: {
          loading: false,
          mode: 'unknown',
          runnable: false,
          message: '无法读取商业视觉引擎状态。为避免误生成，已暂时停用新任务。',
          useCases: []
        }
      };
    case 'account_loaded':
      return {
        ...state,
        account: {
          plan: String(action.account?.plan || 'TRIAL').slice(0, 24).toUpperCase(),
          balance: Number.isFinite(Number(action.account?.balance)) ? Number(action.account.balance) : null,
          entries: Array.isArray(action.account?.entries) ? action.account.entries.slice(0, 50) : []
        }
      };
    case 'product_selected':
      return state.products.some(product => product.id === action.productId)
        ? {
            ...state,
            selectedProductId: action.productId,
            generation: null,
            selectedCandidateId: null,
            savedAssets: [],
            savingCandidateId: null,
            message: null,
            error: null,
            errorCode: null,
            errorStatus: null,
            selectionError: null,
            assetSaveError: null,
            historyError: null
          }
        : state;
    case 'scenario_selected':
      return scenarioById(action.scenarioId)
        ? {
            ...state,
            selectedScenarioId: action.scenarioId,
            generation: null,
            selectedCandidateId: null,
            savedAssets: [],
            savingCandidateId: null,
            message: null,
            error: null,
            errorCode: null,
            errorStatus: null,
            selectionError: null,
            assetSaveError: null,
            historyError: null
          }
        : state;
    case 'generation_started':
      return {
        ...state,
        status: 'directing',
        generation: null,
        selectedCandidateId: null,
        savedAssets: [],
        savingCandidateId: null,
        openingHistoryId: null,
        message: null,
        error: null,
        errorCode: null,
        errorStatus: null,
        selectionError: null,
        assetSaveError: null,
        historyError: null
      };
    case 'stage_changed':
      return VALID_STAGES.has(action.status) && action.status !== 'idle'
        ? { ...state, status: action.status, error: action.status === 'error' ? state.error : null }
        : state;
    case 'generation_completed':
      return {
        ...state,
        status: 'completed',
        generation: action.generation || null,
        selectedCandidateId: null,
        savedAssets: Array.isArray(action.generation?.savedAssets)
          ? action.generation.savedAssets.slice(0, 3)
          : [],
        savingCandidateId: null,
        openingHistoryId: null,
        message: null,
        error: null,
        errorCode: null,
        errorStatus: null,
        selectionError: null,
        assetSaveError: null,
        historyError: null
      };
    case 'candidate_selected':
      return {
        ...state,
        selectedCandidateId: action.candidateId,
        message: '已记录商家选择。',
        selectionError: null,
        selectionErrorCode: null,
        selectionErrorStatus: null
      };
    case 'selection_failed':
      return {
        ...state,
        selectionError: String(action.error || '选图记录失败，请稍后重试。'),
        selectionErrorCode: action.code || null,
        selectionErrorStatus: Number.isInteger(action.status) ? action.status : null,
        message: null
      };
    case 'asset_save_started':
      return {
        ...state,
        savingCandidateId: String(action.candidateId || ''),
        assetSaveError: null,
        assetSaveErrorCode: null,
        assetSaveErrorStatus: null,
        message: null
      };
    case 'asset_saved': {
      const candidateId = String(action.candidateId || '');
      const savedAsset = action.asset && typeof action.asset === 'object'
        ? { ...action.asset, candidateId: action.asset.candidateId || candidateId }
        : { candidateId };
      return {
        ...state,
        savingCandidateId: null,
        savedAssets: candidateId && !state.savedAssets.some(asset => asset.candidateId === candidateId)
          ? [...state.savedAssets, savedAsset].slice(0, 3)
          : state.savedAssets,
        assetSaveError: null,
        assetSaveErrorCode: null,
        assetSaveErrorStatus: null,
        message: '素材已保存，可在素材库中重新下载。'
      };
    }
    case 'asset_save_failed':
      return {
        ...state,
        savingCandidateId: null,
        assetSaveError: String(action.error || '素材保存失败，可先下载图片后重试。'),
        assetSaveErrorCode: action.code || null,
        assetSaveErrorStatus: Number.isInteger(action.status) ? action.status : null,
        message: null
      };
    case 'merchant_decision_recorded':
      return {
        ...state,
        message: action.decision === 'merchant_accepted'
          ? '已记录你明确愿意将这张素材用于实际商品或营销。'
          : '已记录你明确不采用这张素材。',
        error: null,
        errorCode: null,
        errorStatus: null
      };
    case 'history_open_started':
      return {
        ...state,
        openingHistoryId: String(action.generationId || ''),
        error: null,
        errorCode: null,
        errorStatus: null,
        selectionError: null,
        selectionErrorCode: null,
        selectionErrorStatus: null,
        historyError: null,
        historyErrorCode: null,
        historyErrorStatus: null,
        message: null
      };
    case 'history_opened':
      return {
        ...state,
        status: 'completed',
        generation: action.generation || null,
        selectedCandidateId: action.generation?.selectedCandidateId || null,
        savedAssets: Array.isArray(action.generation?.savedAssets)
          ? action.generation.savedAssets.slice(0, 3)
          : [],
        savingCandidateId: null,
        openingHistoryId: null,
        message: '已打开历史任务保存的 Top 3。',
        error: null,
        errorCode: null,
        errorStatus: null,
        selectionError: null,
        assetSaveError: null,
        historyError: null
      };
    case 'history_open_pending':
      return {
        ...state,
        status: VALID_STAGES.has(action.status) && action.status !== 'completed' && action.status !== 'error'
          ? action.status
          : 'directing',
        generation: null,
        selectedCandidateId: null,
        savedAssets: [],
        savingCandidateId: null,
        openingHistoryId: null,
        message: String(action.message || '任务仍在处理中，请稍后重新打开。'),
        error: null,
        errorCode: null,
        errorStatus: null,
        selectionError: null,
        assetSaveError: null,
        historyError: null
      };
    case 'history_open_failed':
      return {
        ...state,
        openingHistoryId: null,
        historyLoaded: action.loadingFailure ? true : state.historyLoaded,
        historyError: String(action.error || '无法打开生成历史，请稍后重试。'),
        historyErrorCode: action.code || null,
        historyErrorStatus: Number.isInteger(action.status) ? action.status : null,
        message: null
      };
    case 'message':
      return { ...state, message: String(action.message || ''), error: null };
    case 'failed':
      return {
        ...state,
        status: 'error',
        productsLoaded: action.scope === 'products' ? true : state.productsLoaded,
        error: String(action.error || '处理失败，请稍后重试。'),
        errorCode: action.code || null,
        errorStatus: Number.isInteger(action.status) ? action.status : null,
        message: null
      };
    default:
      return state;
  }
}

export { MOCK_LABEL };
