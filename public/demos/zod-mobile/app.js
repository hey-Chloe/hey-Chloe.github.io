const inventory = Object.freeze([
  { id: 'demo-h100-sxm-8', model: 'H100 SXM', region: '华北（演示）', gpuCount: 8, vramGiB: 80, hourlyDemoCredit: 18, availability: '演示容量 8 卡' },
  { id: 'demo-h100-pcie-4', model: 'H100 PCIe', region: '华东（演示）', gpuCount: 4, vramGiB: 80, hourlyDemoCredit: 12, availability: '演示容量 4 卡' },
  { id: 'demo-a100-sxm-4', model: 'A100 SXM', region: '华南（演示）', gpuCount: 4, vramGiB: 80, hourlyDemoCredit: 8.8, availability: '演示容量 4 卡' },
  { id: 'demo-l40s-2', model: 'L40S', region: '华东（演示）', gpuCount: 2, vramGiB: 48, hourlyDemoCredit: 4.2, availability: '演示容量 2 卡' },
  { id: 'demo-t4-1', model: 'T4', region: '华北（演示）', gpuCount: 1, vramGiB: 16, hourlyDemoCredit: 1.2, availability: '演示容量 1 卡' },
]);

const state = {
  view: 'consumer',
  filters: { vramGiB: 48, gpuCount: 2, budget: 10 },
  previewNode: null,
};

const screen = document.querySelector('#screen');
const detail = document.querySelector('#detail-sheet');
const detailContent = document.querySelector('#detail-content');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const formatNumber = (value) => Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 });

function hardViolations(item, filters = state.filters) {
  const violations = [];
  if (item.gpuCount < filters.gpuCount) violations.push(`卡数不足：需要 ${filters.gpuCount}，演示资源只有 ${item.gpuCount}`);
  if (item.vramGiB < filters.vramGiB) violations.push(`单卡显存不足：需要 ${filters.vramGiB} GB，演示资源只有 ${item.vramGiB} GB`);
  if (item.hourlyDemoCredit > filters.budget) violations.push(`超出演示预算：上限 ${formatNumber(filters.budget)}，演示单价 ${formatNumber(item.hourlyDemoCredit)}`);
  return violations;
}

function candidateCard(item) {
  const violations = hardViolations(item);
  const passed = violations.length === 0;
  return `<article class="candidate ${passed ? '' : 'rejected'}">
    <div class="candidate-top"><div class="gpu-glyph">GPU</div><div class="candidate-copy"><h3>${esc(item.model)}</h3><p>${esc(item.region)} · ${esc(item.availability)}</p></div><span class="status ${passed ? '' : 'reject'}">${passed ? 'PASS' : 'REJECT'}</span></div>
    <div class="candidate-specs"><span><b>${item.gpuCount} 张</b><small>GPU 卡数</small></span><span><b>${item.vramGiB} GB</b><small>单卡显存</small></span><span><b>${formatNumber(item.hourlyDemoCredit)}</b><small>Demo Credit / h</small></span></div>
    ${passed ? '' : `<p class="violation-line">${esc(violations.join('；'))}</p>`}
    <button class="detail-button" type="button" data-open-detail="${item.id}">${passed ? '查看候选详情' : '查看拒绝原因'}</button>
  </article>`;
}

function renderConsumer() {
  const evaluated = inventory.map((item) => ({ item, passed: hardViolations(item).length === 0 }));
  evaluated.sort((left, right) => Number(right.passed) - Number(left.passed) || left.item.hourlyDemoCredit - right.item.hourlyDemoCredit);
  const passedCount = evaluated.filter(({ passed }) => passed).length;
  screen.innerHTML = `<div class="screen-content">
    <section class="screen-hero"><div><p class="eyebrow">资源市场 / 硬约束</p><h1>找一台符合条件的 GPU</h1><p>只在固定演示库存中筛选。先做显存、卡数和预算硬过滤，再查看原因。</p></div><div class="hero-orbit" aria-hidden="true">⌁</div></section>
    <form class="filter-card" id="filter-form">
      <div class="section-heading"><h2>我的使用要求</h2><span class="micro-label">DETERMINISTIC FILTER</span></div>
      <div class="field-grid">
        <div class="field"><label for="vram">单卡最低显存</label><select id="vram" name="vram"><option value="16">16 GB</option><option value="24">24 GB</option><option value="48">48 GB</option><option value="80">80 GB</option></select></div>
        <div class="field"><label for="gpu-count">最低卡数</label><select id="gpu-count" name="gpuCount"><option value="1">1 张</option><option value="2">2 张</option><option value="4">4 张</option><option value="8">8 张</option></select></div>
        <div class="field wide"><label for="budget">每小时演示预算 · Demo Credit</label><input id="budget" name="budget" type="number" min="0.1" max="999" step="0.1" inputmode="decimal" value="${state.filters.budget}"></div>
      </div>
      <div class="filter-summary"><span>固定演示库存 ${inventory.length} 条</span><span>通过 ${passedCount} 条</span><span>没有排序模型</span></div>
      <button class="detail-button" type="submit">应用硬约束</button>
    </form>
    <div class="results-head"><h2>筛选结果</h2><span>${passedCount} 个通过 · ${inventory.length - passedCount} 个拒绝</span></div>
    <div class="candidate-list">${evaluated.map(({ item }) => candidateCard(item)).join('')}</div>
  </div>`;
  document.querySelector('#vram').value = String(state.filters.vramGiB);
  document.querySelector('#gpu-count').value = String(state.filters.gpuCount);
}

function nodePreview() {
  if (!state.previewNode) return '<div class="empty-preview"><b>还没有演示节点</b><p>提交后只会在当前页面内生成预览，不会配置、验证或连接任何真实机器。</p></div>';
  const node = state.previewNode;
  return `<article class="node-preview"><span class="preview-label">IN-MEMORY PREVIEW · NOT ENROLLED</span><h2>${esc(node.name)}</h2><p>${esc(node.model)} · ${esc(node.region)}</p><div class="preview-specs"><div><small>节点 GPU</small><strong>${node.gpuCount} 张</strong></div><div><small>单卡显存</small><strong>${node.vramGiB} GB</strong></div><div><small>可售总量</small><strong>${formatNumber(node.capacity)} GPU时</strong></div><div><small>持久化</small><strong>仅当前内存</strong></div></div><div class="preview-states"><span>资料未核验</span><span>节点未接入</span><span>方案未创建</span><span>未上架</span></div><button class="secondary-button" type="button" data-clear-preview>清空预览</button></article>`;
}

function renderProvider(error = '') {
  screen.innerHTML = `<div class="screen-content">
    <section class="screen-hero"><div><p class="eyebrow">提供算力 / 演示登记</p><h1>登记一台演示节点</h1><p>复现原生端的资源字段与审核顺序，但不会生成密钥、节点命令或真实上架。</p></div><div class="hero-orbit" aria-hidden="true">＋</div></section>
    <div class="flow-steps" aria-label="原生产品流程"><span><b>01</b>添加资源</span><span><b>02</b>资料核验</span><span><b>03</b>节点接入</span><span><b>04</b>创建方案</span></div>
    <form class="provider-form" id="provider-form">
      <div class="section-heading"><h2>演示节点资料</h2><span class="micro-label">NO REAL NODE</span></div>
      <div class="field-grid">
        <div class="field wide"><label for="node-name">节点名称</label><input id="node-name" name="name" maxlength="36" required placeholder="例如：我的 H100 节点"></div>
        <div class="field"><label for="node-model">GPU 型号</label><select id="node-model" name="model"><option>H100 SXM</option><option>A100 SXM</option><option>L40S</option><option>RTX 4090</option></select></div>
        <div class="field"><label for="node-region">地区</label><select id="node-region" name="region"><option>华东（演示）</option><option>华北（演示）</option><option>华南（演示）</option></select></div>
        <div class="field"><label for="node-count">GPU 数量</label><input id="node-count" name="gpuCount" type="number" min="1" max="64" step="1" inputmode="numeric" value="4" required></div>
        <div class="field"><label for="node-vram">单卡显存 · GB</label><input id="node-vram" name="vramGiB" type="number" min="1" max="1024" step="1" inputmode="numeric" value="80" required></div>
        <div class="field wide"><label for="node-capacity">可售总量 · GPU时</label><input id="node-capacity" name="capacity" type="number" min="1" max="100000" step="1" inputmode="numeric" value="240" required></div>
      </div>
      ${error ? `<p class="inline-error" role="alert">${esc(error)}</p>` : ''}
      <p class="form-note">这不是原生 App，也不会申请资源方资格、生成一次性接入配置或读取你的设备。</p>
      <button class="primary-button" type="submit">生成本页预览卡</button>
    </form>
    <div id="preview-region">${nodePreview()}</div>
  </div>`;
}

function render() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (state.view === 'consumer') renderConsumer(); else renderProvider();
}

function updateFilters(form) {
  const data = new FormData(form);
  const budget = Number(data.get('budget'));
  state.filters = {
    vramGiB: Number(data.get('vram')),
    gpuCount: Number(data.get('gpuCount')),
    budget: Number.isFinite(budget) && budget > 0 ? budget : 0.1,
  };
  renderConsumer();
}

function openDetail(itemId) {
  const item = inventory.find((candidate) => candidate.id === itemId);
  if (!item) return;
  const violations = hardViolations(item);
  const passed = violations.length === 0;
  detailContent.innerHTML = `<p class="eyebrow">候选详情 / DEMO INVENTORY</p><h2 id="detail-title">${esc(item.model)}</h2><p>${esc(item.region)}。以下只解释当前硬过滤结果，不是库存承诺、报价或下单入口。</p><div class="detail-ledger"><div><small>GPU 卡数</small><strong>${item.gpuCount} 张</strong></div><div><small>单卡显存</small><strong>${item.vramGiB} GB</strong></div><div><small>演示单价</small><strong>${formatNumber(item.hourlyDemoCredit)} Credit / h</strong></div><div><small>资源状态</small><strong>固定 Fixture</strong></div></div><div class="decision-box ${passed ? '' : 'reject'}"><b>${passed ? '硬约束通过' : '硬约束拒绝'}</b><p>${passed ? '卡数、单卡显存与每小时演示预算均满足当前输入。仍然不能购买或创建订单。' : esc(violations.join('；'))}</p></div>`;
  detail.hidden = false;
  detail.setAttribute('aria-hidden', 'false');
  detail.querySelector('[data-close-detail]').focus();
}

function closeDetail() {
  detail.hidden = true;
  detail.setAttribute('aria-hidden', 'true');
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.view) { state.view = button.dataset.view; closeDetail(); render(); }
  if (button.dataset.openDetail) openDetail(button.dataset.openDetail);
  if (button.hasAttribute('data-close-detail') || button === detail) closeDetail();
  if (button.hasAttribute('data-clear-preview')) { state.previewNode = null; renderProvider(); }
});

screen.addEventListener('change', (event) => {
  if (event.target.closest('#filter-form')) updateFilters(event.target.form);
});

screen.addEventListener('submit', (event) => {
  if (event.target.id === 'filter-form') {
    event.preventDefault();
    updateFilters(event.target);
    return;
  }
  if (event.target.id !== 'provider-form') return;
  event.preventDefault();
  const data = new FormData(event.target);
  const next = {
    name: String(data.get('name') || '').trim(), model: String(data.get('model') || ''), region: String(data.get('region') || ''),
    gpuCount: Number(data.get('gpuCount')), vramGiB: Number(data.get('vramGiB')), capacity: Number(data.get('capacity')),
  };
  if (next.name.length < 2) { renderProvider('请为演示节点填写至少两个字的名称。'); return; }
  if (![next.gpuCount, next.vramGiB, next.capacity].every((value) => Number.isFinite(value) && value > 0)) { renderProvider('GPU 数量、显存和可售总量必须是大于 0 的数字。'); return; }
  state.previewNode = next;
  renderProvider();
  document.querySelector('#preview-region')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !detail.hidden) closeDetail(); });

render();
