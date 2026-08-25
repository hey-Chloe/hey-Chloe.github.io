import {
  SCENARIOS,
  buildGenerationRequest,
  captureFocusKey,
  createInitialState,
  focusKey,
  restoreFocusKey,
  workbenchReducer
} from './state.mjs?v=4.0-productization';
import { candidateCards, historyRows, pipelineView, rejectionSummary, resultHeading } from './view-model.mjs?v=4.0-productization';

const RUNNING_STAGES = new Set(['directing', 'retrieving', 'generating', 'judging']);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function button(label, className = '') {
  const node = element('button', className, label);
  node.type = 'button';
  return node;
}

function assignFocusKey(node, key) {
  if (key) node.dataset.focusKey = key;
  return node;
}

function recoveryLink(href, label, key) {
  const link = element('a', 'kai-wb-recovery-link', label);
  link.href = href;
  assignFocusKey(link, key);
  return link;
}

function requestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `kai_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function delay(milliseconds) {
  return new Promise(resolve => globalThis.setTimeout(resolve, milliseconds));
}

function unpackGeneration(payload) {
  const task = payload?.generation || payload?.job || payload || {};
  const output = task.output || task.result || (Array.isArray(task.topCandidates) ? task : null);
  return { task, output };
}

function normalizedStage(payload) {
  const raw = String(payload?.stage || payload?.status || '').toLowerCase();
  if (['directing', 'planning', 'queued', 'pending'].includes(raw)) return 'directing';
  if (['retrieving', 'retrieval'].includes(raw)) return 'retrieving';
  if (['generating', 'generation', 'running'].includes(raw)) return 'generating';
  if (['judging', 'ranking', 'evaluating', 'awaiting_review'].includes(raw)) return 'judging';
  if (['completed', 'succeeded', 'success'].includes(raw)) return 'completed';
  if (['failed', 'error', 'cancelled'].includes(raw)) return 'error';
  return null;
}

function workspaceNav(state) {
  const nav = element('nav', 'kai-wb-nav');
  nav.setAttribute('aria-label', '商业创意工作区导航');
  const brand = element('a', 'kai-wb-brand', 'KAI / COMMERCE');
  brand.href = '../../work/';
  const links = element('div', 'kai-wb-nav-links');
  links.append(
    element('span', 'kai-wb-recovery-link', '商品'),
    element('span', 'kai-wb-recovery-link', '素材库'),
    element('span', 'kai-wb-recovery-link', '额度')
  );
  const account = element('div', 'kai-wb-account');
  account.append(
    element('span', null, state.account.plan),
    element('strong', null, state.account.balance == null ? '-- credits' : `${state.account.balance} credits`)
  );
  nav.append(brand, links, account);
  return nav;
}

function headingBlock() {
  const block = element('div', 'kai-wb-heading');
  const back = element('a', 'kai-wb-back', '返回 Work');
  back.href = '../../work/';
  assignFocusKey(back, focusKey('back-link'));
  const eyebrow = element('span', 'kai-wb-eyebrow', '商业创意工作区');
  const title = element('h1', null, '为这件商品创建一组商业图');
  const copy = element('p', null, '选择商品与创意目标即可。策略、生成路径和商业质检由系统自动完成。');
  block.append(back, eyebrow, title, copy);
  return block;
}

function renderPipeline(status) {
  const section = element('section', 'kai-wb-panel kai-wb-progress');
  section.setAttribute('aria-labelledby', 'kai-wb-progress-title');
  const title = element('h2', null, '处理进度');
  title.id = 'kai-wb-progress-title';
  const list = element('ol', 'kai-wb-stage-list');
  for (const [index, stage] of pipelineView(status).entries()) {
    const item = element('li', `is-${stage.state}`);
    if (stage.state === 'active') item.setAttribute('aria-current', 'step');
    const marker = element('span', 'kai-wb-stage-marker', String(index + 1).padStart(2, '0'));
    const label = element('span', 'kai-wb-stage-label', stage.label);
    const stateLabel = element('small', null, stage.state === 'complete' ? '已完成' : stage.state === 'active' ? '处理中' : '等待');
    item.append(marker, label, stateLabel);
    list.append(item);
  }
  section.append(title, list);
  return section;
}

function renderControls(state, dispatch, start) {
  const form = element('form', 'kai-wb-panel kai-wb-controls');
  const title = element('h2', null, '配置这次创意');
  const running = RUNNING_STAGES.has(state.status);

  const productLabel = element('label', 'kai-wb-field');
  productLabel.append(element('span', null, '1 / 选择已上传商品'));
  const productSelect = element('select');
  assignFocusKey(productSelect, focusKey('product-select'));
  productSelect.name = 'productId';
  productSelect.required = true;
  productSelect.disabled = running || !state.productsLoaded || state.products.length === 0;
  if (!state.productsLoaded) {
    const option = element('option', null, '正在读取商品资产…');
    option.value = '';
    productSelect.append(option);
  } else if (state.products.length === 0) {
    const option = element('option', null, '暂无商品');
    option.value = '';
    productSelect.append(option);
  } else {
    for (const product of state.products) {
      const option = element('option', null, `${product.name}${product.sku ? ` · ${product.sku}` : ''}`);
      option.value = product.id;
      option.selected = product.id === state.selectedProductId;
      productSelect.append(option);
    }
  }
  productSelect.addEventListener('change', () => dispatch({ type: 'product_selected', productId: productSelect.value }));
  productLabel.append(productSelect);
  if (state.productsLoaded && state.products.length === 0) {
    const emptyHelp = element('span', 'kai-wb-field-help');
    emptyHelp.append('还没有可用商品。浏览器沙箱不接收真实上传。');
    productLabel.append(emptyHelp);
  }

  const selectedProduct = state.products.find(product => product.id === state.selectedProductId);
  const productPreview = element('figure', 'kai-wb-product-preview');
  if (selectedProduct?.imageUrl) {
    const image = element('img');
    image.src = selectedProduct.imageUrl;
    image.alt = selectedProduct.name;
    productPreview.append(image);
  } else {
    productPreview.append(element('div', 'kai-wb-product-placeholder', '暂无商品预览'));
  }
  const productCopy = element('figcaption');
  productCopy.append(
    element('strong', null, selectedProduct?.name || '等待选择商品'),
    element('small', null, selectedProduct ? `${selectedProduct.category || '未分类'}${selectedProduct.sku ? ` · ${selectedProduct.sku}` : ''}` : '上传商品后即可开始')
  );
  productPreview.append(productCopy);

  const scenarioGroup = element('fieldset', 'kai-wb-scenarios');
  scenarioGroup.disabled = running;
  scenarioGroup.append(element('legend', null, '2 / 选择创意目标'));
  const cards = element('div', 'kai-wb-scenario-grid');
  for (const scenario of SCENARIOS) {
    const label = element('label', 'kai-wb-scenario');
    const input = element('input');
    input.type = 'radio';
    input.name = 'scenario';
    input.value = scenario.id;
    input.checked = scenario.id === state.selectedScenarioId;
    assignFocusKey(input, focusKey('scenario', scenario.id));
    input.addEventListener('change', () => dispatch({ type: 'scenario_selected', scenarioId: scenario.id }));
    const copy = element('span', 'kai-wb-scenario-copy');
    copy.append(element('strong', null, scenario.label), element('small', null, scenario.description));
    label.append(input, copy);
    cards.append(label);
  }
  scenarioGroup.append(cards);

  const availabilityClass = state.engine.loading
    ? 'is-loading'
    : state.engine.runnable ? state.engine.mode === 'mock' ? 'is-mock' : 'is-ready' : 'is-disabled';
  const availability = element('div', `kai-wb-availability ${availabilityClass}`);
  availability.id = 'kai-wb-engine-availability';
  availability.setAttribute('role', 'status');
  if (state.engine.mode === 'mock' && state.engine.runnable) {
    availability.append(element('strong', null, 'MOCK / NOT REAL AI OUTPUT'));
  }
  availability.append(element('span', null, state.engine.message));

  const billing = element('div', 'kai-wb-billing');
  billing.append(
    element('span', null, state.engine.mode === 'mock' ? '开发边界' : '本次费用'),
    element('strong', null, state.engine.mode === 'mock' ? 'Mock 不代表真实质量' : '完成后以额度账本为准')
  );
  const submit = element('button', 'kai-wb-primary', running ? '正在生成与质检…' : '生成商业创意');
  submit.type = 'submit';
  assignFocusKey(submit, focusKey('generation-submit'));
  submit.disabled = !running && (!state.selectedProductId || !state.engine.runnable || state.engine.loading);
  submit.setAttribute('aria-describedby', availability.id);
  if (running) {
    submit.setAttribute('aria-disabled', 'true');
    submit.setAttribute('aria-busy', 'true');
  }
  const disclosure = element('p', 'kai-wb-disclosure', '系统会自动匹配生成能力。只有具备真实评估证据时，结果才会标记为商业优选 Top 3。');

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (running || !state.engine.runnable || !state.selectedProductId) return;
    start();
  });
  form.append(title, productLabel, productPreview, scenarioGroup, availability, billing, submit, disclosure);
  return form;
}

function renderFeedback(state) {
  const live = element('div', 'kai-wb-live');
  live.setAttribute('aria-live', 'polite');
  const problem = state.error
    ? { message: state.error, code: state.errorCode, status: state.errorStatus }
    : state.selectionError
      ? { message: state.selectionError, code: state.selectionErrorCode, status: state.selectionErrorStatus }
      : state.assetSaveError
        ? { message: state.assetSaveError, code: state.assetSaveErrorCode, status: state.assetSaveErrorStatus }
      : state.historyError
        ? { message: state.historyError, code: state.historyErrorCode, status: state.historyErrorStatus }
        : null;
  live.setAttribute('role', problem ? 'alert' : 'status');
  if (problem) {
    live.classList.add('is-error');
    live.append(element('span', null, problem.message));
    if (problem.status === 401 || problem.code === 'AUTH_REQUIRED') {
      live.append(recoveryLink('../../work/', '返回 Work', focusKey('login-recovery')));
    }
  } else if (state.message) {
    live.classList.add('is-success');
    live.textContent = state.message;
  } else if (RUNNING_STAGES.has(state.status)) {
    live.textContent = '任务正在服务器处理，页面会自动更新。';
  }
  return live;
}

function renderResults(state, selectCandidate, saveCandidate, recordDecision) {
  const generation = state.generation;
  const heading = resultHeading(generation);
  const section = element('section', 'kai-wb-results');
  section.setAttribute('aria-labelledby', 'kai-wb-results-title');
  const head = element('div', 'kai-wb-section-head');
  const copy = element('div');
  const title = element('h2', null, heading.title);
  title.id = 'kai-wb-results-title';
  title.tabIndex = -1;
  assignFocusKey(title, focusKey('results-heading'));
  copy.append(title, element('p', null, heading.note));
  head.append(copy);
  if (heading.isMock) head.append(element('strong', 'kai-wb-mock-badge', 'MOCK / NOT REAL AI OUTPUT'));
  section.append(head);

  const cards = candidateCards(generation, globalThis.location?.href || 'https://kai.invalid/');
  const grid = element('div', 'kai-wb-candidate-grid');
  for (const card of cards) {
    const article = element('article', 'kai-wb-candidate');
    if (card.isMock) article.classList.add('is-mock');
    const visual = element('div', 'kai-wb-candidate-visual');
    if (card.imageUrl) {
      const image = element('img');
      image.src = card.imageUrl;
      image.alt = card.alt;
      image.loading = 'lazy';
      visual.append(image);
    } else {
      visual.append(element('span', 'kai-wb-placeholder-index', String(card.displayOrder).padStart(2, '0')));
      visual.append(element('small', null, '演示占位，未执行真实图像生成'));
    }
    if (card.isMock) visual.append(element('b', 'kai-wb-visual-badge', card.mockLabel));

    const body = element('div', 'kai-wb-candidate-body');
    const row = element('div', 'kai-wb-candidate-title');
    row.append(element('strong', null, card.role));
    if (card.qualityRank != null) row.append(element('span', null, `真实评估排名 #${card.qualityRank}`));
    else row.append(element('span', null, `展示顺序 ${card.displayOrder}`));
    body.append(row);

    if (card.hardFilterPassed === true) body.append(element('p', 'kai-wb-pass', '已通过硬性质检'));
    if (card.reasons.length) {
      const list = element('ul', 'kai-wb-reasons');
      for (const reason of card.reasons) list.append(element('li', null, reason));
      body.append(list);
    }

    const actions = element('div', 'kai-wb-candidate-actions');
    const selected = state.selectedCandidateId === card.id;
    const choose = button(selected ? '已选用' : '选用此图', `kai-wb-secondary${selected ? ' is-selected' : ''}`);
    assignFocusKey(choose, focusKey('candidate', card.id));
    choose.setAttribute('aria-pressed', selected ? 'true' : 'false');
    choose.addEventListener('click', () => {
      if (!selected) selectCandidate(card.id);
    });
    actions.append(choose);
    const savedAsset = state.savedAssets.find(asset => asset?.candidateId === card.id || asset?.sourceCandidateId === card.id);
    const saved = Boolean(savedAsset);
    const saving = state.savingCandidateId === card.id;
    const save = button(saved ? '已保存到素材库' : saving ? '正在保存…' : '保存到素材库', `kai-wb-save${saved ? ' is-saved' : ''}`);
    assignFocusKey(save, focusKey('save', card.id));
    save.disabled = saving || !card.imageUrl;
    save.setAttribute('aria-pressed', saved ? 'true' : 'false');
    if (!card.imageUrl) save.title = '当前结果没有可保存的真实文件';
    save.addEventListener('click', () => {
      if (!saved && !saving && card.imageUrl) saveCandidate(card.id);
    });
    actions.append(save);
    if (savedAsset?.downloadUrl) {
      const download = element('a', 'kai-wb-download', '下载已保存素材');
      download.href = savedAsset.downloadUrl;
      download.download = '';
      download.rel = 'noopener';
      actions.append(download);
    } else {
      const unavailable = element('span', 'kai-wb-download is-disabled', card.imageUrl ? '保存后下载' : '无演示文件');
      unavailable.setAttribute('aria-disabled', 'true');
      actions.append(unavailable);
    }
    if (saved && generation?.evidenceStatus === 'real') {
      const decision = element('div', 'kai-wb-merchant-decision');
      const statement = element('textarea');
      statement.rows = 2;
      statement.maxLength = 500;
      statement.placeholder = '请说明将用于哪个真实商品或营销渠道（必填）';
      statement.setAttribute('aria-label', '商家采用或拒绝说明');
      assignFocusKey(statement, focusKey('decision', card.id));
      const accept = button('愿意用于实际营销', 'kai-wb-accept');
      const reject = button('不采用这张', 'kai-wb-secondary');
      accept.addEventListener('click', () => recordDecision(card.id, 'merchant_accepted', statement.value));
      reject.addEventListener('click', () => recordDecision(card.id, 'merchant_rejected', statement.value));
      decision.append(statement, accept, reject);
      body.append(decision);
    }
    body.append(actions);
    article.append(visual, body);
    grid.append(article);
  }

  if (!cards.length) grid.append(element('p', 'kai-wb-empty', '完成一次有证据的生成与质检后，这里只显示最多 3 张。'));
  section.append(grid);

  const rejected = rejectionSummary(generation);
  if (rejected.rejectedCount > 0) {
    const details = element('details', 'kai-wb-rejection-summary');
    details.append(element('summary', null, `查看未展示结果的质检说明（${rejected.rejectedCount} 张）`));
    const list = element('ul');
    for (const reason of rejected.reasons) list.append(element('li', null, `${reason.label} × ${reason.count}`));
    details.append(list);
    section.append(details);
  }
  return section;
}

function renderHistory(state, openHistory) {
  const section = element('section', 'kai-wb-history kai-wb-panel');
  const head = element('div', 'kai-wb-section-head');
  const copy = element('div');
  copy.append(element('span', 'kai-wb-eyebrow', '创作记录'), element('h2', null, '生成历史'));
  head.append(copy, element('p', null, '仅记录实际任务状态；Mock 任务会单独标记。'));
  section.append(head);

  const rows = historyRows(state.history);
  const list = element('div', 'kai-wb-history-list');
  for (const row of rows) {
    const article = element('article');
    const main = element('div');
    main.append(element('strong', null, row.productName), element('span', null, row.scenarioLabel));
    const meta = element('div', 'kai-wb-history-meta');
    meta.append(element('span', null, row.status), element('small', null, row.createdAt || '时间未知'));
    if (row.selectedCount > 0) meta.append(element('small', null, `已选 ${row.selectedCount} 张`));
    if (row.isMock) meta.append(element('b', 'kai-wb-history-mock', 'MOCK'));
    const opening = state.openingHistoryId === row.id;
    const reopen = button(opening ? '正在打开…' : row.statusCode === 'completed' ? '重新打开结果' : '查看任务', 'kai-wb-history-open');
    assignFocusKey(reopen, focusKey('history', row.id));
    reopen.setAttribute('aria-disabled', opening ? 'true' : 'false');
    reopen.addEventListener('click', () => {
      if (!opening) openHistory(row.id);
    });
    const tail = element('div', 'kai-wb-history-tail');
    tail.append(meta, reopen);
    article.append(main, tail);
    list.append(article);
  }
  if (!rows.length) {
    list.append(element('p', 'kai-wb-empty', state.historyLoaded ? '还没有商业图生成记录。' : '正在读取生成历史…'));
  }
  section.append(list);
  return section;
}

export function mountCommerceWorkbench(root, { api, pollIntervalMs = 900 } = {}) {
  if (!(root instanceof Element)) throw new Error('工作台需要有效的挂载节点。');
  if (!api || typeof api.startGeneration !== 'function') throw new Error('工作台需要 API 适配器。');

  let state = createInitialState();
  let activeRun = 0;
  let destroyed = false;

  function dispatch(action, { restoreKey } = {}) {
    const retainedFocus = restoreKey === undefined
      ? captureFocusKey(root, root.ownerDocument?.activeElement)
      : restoreKey;
    state = workbenchReducer(state, action);
    render(retainedFocus);
  }

  async function loadHistory() {
    if (typeof api.listHistory !== 'function') return;
    try {
      const history = await api.listHistory();
      if (!destroyed) dispatch({ type: 'history_loaded', history });
    } catch (error) {
      if (!destroyed) {
        dispatch({
          type: 'history_open_failed',
          error: error?.message,
          code: error?.code,
          status: error?.status,
          loadingFailure: true
        });
      }
    }
  }

  async function start() {
    if (!state.engine.runnable || !state.selectedProductId || RUNNING_STAGES.has(state.status)) return;
    const run = ++activeRun;
    try {
      const payload = buildGenerationRequest({
        products: state.products,
        selectedProductId: state.selectedProductId,
        selectedScenarioId: state.selectedScenarioId,
        requestId: requestId()
      });
      dispatch({ type: 'generation_started' });
      let response = await api.startGeneration(payload);
      let { task, output } = unpackGeneration(response);
      const taskId = String(task.id || task.requestId || payload.requestId);

      for (let attempt = 0; attempt < 180 && !output; attempt += 1) {
        if (destroyed || run !== activeRun) return;
        const stage = normalizedStage(task);
        if (stage === 'error') throw new Error(task.error || task.failureReason || '生成任务失败。');
        if (stage) dispatch({ type: 'stage_changed', status: stage });
        await delay(pollIntervalMs);
        const getGeneration = typeof api.getGeneration === 'function' ? api.getGeneration : api.generationStatus;
        if (typeof getGeneration !== 'function') throw new Error('API 未提供生成任务状态接口。');
        response = await getGeneration(taskId);
        ({ task, output } = unpackGeneration(response));
      }
      if (!output) throw new Error('任务处理超时，请到生成历史中稍后查看。');
      if (destroyed || run !== activeRun) return;

      const generation = { ...output, id: output.id || taskId, requestId: output.requestId || payload.requestId };
      dispatch({ type: 'generation_completed', generation });
      await loadHistory();
    } catch (error) {
      if (!destroyed && run === activeRun) {
        dispatch({ type: 'failed', error: error?.message, code: error?.code, status: error?.status });
      }
    }
  }

  async function selectCandidate(candidateId) {
    try {
      const generationId = state.generation?.id || state.generation?.requestId;
      if (!generationId) throw new Error('生成任务标识缺失。');
      await api.selectCandidate(generationId, candidateId);
      dispatch({ type: 'candidate_selected', candidateId });
      await loadHistory();
    } catch (error) {
      dispatch({
        type: 'selection_failed',
        error: error?.message,
        code: error?.code,
        status: error?.status
      });
    }
  }

  async function saveCandidate(candidateId) {
    const generationId = state.generation?.id || state.generation?.requestId;
    dispatch({ type: 'asset_save_started', candidateId }, { restoreKey: focusKey('save', candidateId) });
    try {
      if (!generationId) throw new Error('生成任务标识缺失。');
      if (typeof api.saveCandidate !== 'function') {
        const error = new Error('当前部署尚未启用素材保存；可先下载图片。');
        error.status = 404;
        throw error;
      }
      const response = await api.saveCandidate(generationId, candidateId);
      const asset = response?.asset || response;
      if (!asset?.downloadUrl) throw new Error('素材已返回但缺少安全下载地址，请稍后重试。');
      dispatch({ type: 'asset_saved', candidateId, asset }, { restoreKey: focusKey('save', candidateId) });
      await loadHistory();
    } catch (error) {
      dispatch({
        type: 'asset_save_failed',
        error: error?.status === 404 ? '当前部署尚未启用素材保存；可先下载图片。' : error?.message,
        code: error?.code,
        status: error?.status
      }, { restoreKey: focusKey('save', candidateId) });
    }
  }

  async function recordDecision(candidateId, decision, statement) {
    const generationId = state.generation?.id || state.generation?.requestId;
    const normalized = String(statement || '').trim();
    try {
      if (!generationId) throw new Error('生成任务标识缺失。');
      if (normalized.length < 2) throw new Error('请明确说明会用于哪里，或为什么不采用。');
      if (typeof api.recordMerchantDecision !== 'function') throw new Error('当前部署尚未启用商家采用反馈。');
      await api.recordMerchantDecision(generationId, candidateId, decision, normalized, requestId());
      dispatch({ type: 'merchant_decision_recorded', decision }, { restoreKey: focusKey('decision', candidateId) });
      await loadHistory();
    } catch (error) {
      dispatch({ type: 'failed', error: error?.message, code: error?.code, status: error?.status }, { restoreKey: focusKey('decision', candidateId) });
    }
  }

  async function openHistory(generationId) {
    const historyKey = focusKey('history', generationId);
    dispatch({ type: 'history_open_started', generationId }, { restoreKey: historyKey });
    try {
      if (typeof api.getGeneration !== 'function') throw new Error('API 未提供历史任务详情接口。');
      const response = await api.getGeneration(generationId);
      if (destroyed) return;
      const { task, output } = unpackGeneration(response);
      if (output) {
        const generation = {
          ...output,
          id: output.id || task.id || generationId,
          requestId: output.requestId || task.requestId || generationId,
          selectedCandidateId: task.selectedCandidateId || output.selectedCandidateId || null,
          savedAssets: task.savedAssets || output.savedAssets || []
        };
        dispatch({ type: 'history_opened', generation }, { restoreKey: focusKey('results-heading') });
        return;
      }
      const stage = normalizedStage(task);
      if (stage === 'completed') throw new Error('该历史任务未返回已保存的 Top 3。');
      if (stage === 'error') throw new Error(task.error || task.failureReason || '历史任务已失败。');
      dispatch({
        type: 'history_open_pending',
        status: stage,
        message: '该任务仍在处理中，请稍后从生成历史重新打开。'
      }, { restoreKey: historyKey });
    } catch (error) {
      if (!destroyed) {
        dispatch({
          type: 'history_open_failed',
          error: error?.message,
          code: error?.code,
          status: error?.status
        }, { restoreKey: historyKey });
      }
    }
  }

  function render(retainedFocus = null) {
    const shell = element('main', 'kai-wb-shell');
    shell.append(workspaceNav(state), headingBlock(), renderFeedback(state));
    const setup = element('div', 'kai-wb-setup-grid');
    setup.append(renderControls(state, dispatch, start), renderPipeline(state.status));
    shell.append(setup, renderResults(state, selectCandidate, saveCandidate, recordDecision), renderHistory(state, openHistory));
    root.replaceChildren(shell);
    if (retainedFocus) restoreFocusKey(root, retainedFocus);
  }

  render();
  const call = (method, fallback) => typeof method === 'function'
    ? Promise.resolve().then(() => method())
    : Promise.resolve(fallback);
  Promise.allSettled([
    call(api.getConfig, null),
    call(api.listProducts, []),
    call(api.listHistory, []),
    call(api.getCredits, null)
  ]).then(([configResult, productsResult, historyResult, accountResult]) => {
    if (destroyed) return;
    state = workbenchReducer(state, configResult.status === 'fulfilled' && configResult.value
      ? { type: 'engine_config_loaded', config: configResult.value }
      : { type: 'engine_config_failed' });
    state = workbenchReducer(state, productsResult.status === 'fulfilled'
      ? { type: 'products_loaded', products: productsResult.value }
      : {
          type: 'failed',
          scope: 'products',
          error: productsResult.reason?.message,
          code: productsResult.reason?.code,
          status: productsResult.reason?.status
        });
    const requestedProductId = new URLSearchParams(globalThis.location?.search || '').get('productId');
    if (requestedProductId) state = workbenchReducer(state, { type: 'product_selected', productId: requestedProductId });
    state = workbenchReducer(state, historyResult.status === 'fulfilled'
      ? { type: 'history_loaded', history: historyResult.value }
      : {
          type: 'history_open_failed',
          loadingFailure: true,
          error: historyResult.reason?.message,
          code: historyResult.reason?.code,
          status: historyResult.reason?.status
        });
    if (accountResult.status === 'fulfilled' && accountResult.value) {
      state = workbenchReducer(state, { type: 'account_loaded', account: accountResult.value });
    }
    render();
  });

  return Object.freeze({
    destroy() {
      destroyed = true;
      activeRun += 1;
      root.replaceChildren();
    },
    getState() {
      return structuredClone(state);
    }
  });
}
