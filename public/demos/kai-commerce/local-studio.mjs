const root = document.querySelector('#kai-commercial-workbench');

const PRODUCTS = {
  perfume: { name: '黑金淡香水', category: '香氛', tagline: '把夜色留在衣领上' },
  coffee: { name: '山场挂耳咖啡', category: '咖啡', tagline: '三分钟，回到山里' },
  speaker: { name: '桌面蓝牙音箱', category: '数码', tagline: '让小空间也有好声音' }
};

const GOALS = {
  main: { label: '电商主图', note: '主体清晰，信息克制' },
  social: { label: '种草分享', note: '带一点生活感和情绪' },
  cover: { label: '视频封面', note: '更强对比和视觉钩子' }
};

const FORMATS = {
  square: { label: '1:1 方图', width: 1080, height: 1080 },
  portrait: { label: '4:5 竖图', width: 1080, height: 1350 },
  story: { label: '9:16 封面', width: 1080, height: 1920 }
};

const VARIANTS = [
  { id: 'a', label: '留白主视觉', note: '克制、清楚' },
  { id: 'b', label: '柔和场景', note: '轻松、有气氛' },
  { id: 'c', label: '高对比封面', note: '醒目、有节奏' }
];

const state = {
  productId: 'perfume',
  customImage: null,
  customUrl: null,
  customName: '',
  goal: 'main',
  format: 'square',
  title: PRODUCTS.perfume.name,
  tagline: PRODUCTS.perfume.tagline,
  variants: [],
  selectedIndex: 0,
  generating: false,
  challenge: { mode: 'idle', startedAt: 0, remaining: 60, timer: null }
};

root.innerHTML = `
  <main class="studio-shell">
    <nav class="studio-nav" aria-label="创作工作台导航">
      <a class="studio-brand" href="../../work/">KAI / COMMERCE</a>
      <strong>商品图创作工作台</strong>
      <a href="../../work/">返回作品收藏</a>
    </nav>

    <header class="studio-intro">
      <div>
        <p class="studio-kicker">可操作作品演示</p>
        <h1>选一件商品，亲手做出三张可下载的图片。</h1>
      </div>
      <div class="studio-intro-copy">
        <p>试着换商品、改文案和画幅，再选中你喜欢的方案。这里展示的是创作流程和交互，而不是一段只能观看的视频。</p>
        <span class="truth-note">浏览器本地合成演示，不调用线上生成模型</span>
      </div>
    </header>

    <section class="challenge-strip" aria-label="60 秒创作挑战">
      <div class="challenge-copy">
        <strong>60 秒创作挑战</strong>
        <span>在倒计时结束前生成并下载一张商品图</span>
      </div>
      <div class="challenge-track" aria-hidden="true"><span></span></div>
      <button class="challenge-action" type="button">开始挑战</button>
    </section>

    <section class="workspace" aria-label="商品图创作工作台">
      <form class="control-panel">
        <div class="section-head">
          <h2>创作配方</h2>
          <span>01 — 04</span>
        </div>

        <label class="field">
          <span>01 / 选择商品</span>
          <div class="product-row">
            <select name="product" aria-label="选择样例商品">
              <option value="perfume">几何样例 · 黑金淡香水</option>
              <option value="coffee">几何样例 · 山场挂耳咖啡</option>
              <option value="speaker">几何样例 · 桌面蓝牙音箱</option>
            </select>
            <label class="upload-label">
              上传图片
              <input type="file" name="upload" accept="image/png,image/jpeg,image/webp" aria-label="上传自己的商品图片">
            </label>
          </div>
          <small>默认三款是几何绘制样例，不代表真实商品证据；上传图片只在本机读取。</small>
        </label>

        <fieldset>
          <legend>02 / 选择用途</legend>
          <div class="goal-grid">
            <label class="choice"><input type="radio" name="goal" value="main" checked><span>电商主图</span></label>
            <label class="choice"><input type="radio" name="goal" value="social"><span>种草分享</span></label>
            <label class="choice"><input type="radio" name="goal" value="cover"><span>视频封面</span></label>
          </div>
        </fieldset>

        <div class="field">
          <span>03 / 写下卖点</span>
          <input type="text" name="title" maxlength="18" value="黑金淡香水" aria-label="图片主标题">
          <input type="text" name="tagline" maxlength="32" value="把夜色留在衣领上" aria-label="图片副标题">
        </div>

        <fieldset>
          <legend>04 / 选择画幅</legend>
          <div class="format-grid">
            <label class="choice"><input type="radio" name="format" value="square" checked><span>1:1 方图</span></label>
            <label class="choice"><input type="radio" name="format" value="portrait"><span>4:5 竖图</span></label>
            <label class="choice"><input type="radio" name="format" value="story"><span>9:16 封面</span></label>
          </div>
        </fieldset>

        <button class="generate-button" type="submit">生成 3 张本地图片</button>
        <div class="stage-list" aria-hidden="true"><span></span><span></span><span></span></div>
        <p class="status-line" role="status" aria-live="polite">准备好了。先选商品，也可以直接用默认配方开始。</p>
      </form>

      <section class="canvas-panel" aria-labelledby="canvas-title">
        <div class="canvas-head">
          <div>
            <h2 id="canvas-title">作品画布</h2>
            <p>三张都由当前浏览器实时绘制，可选中并下载 PNG。</p>
          </div>
          <span class="canvas-badge">REAL CANVAS OUTPUT</span>
        </div>
        <div class="hero-canvas-wrap">
          <div class="hero-canvas-frame">
            <div class="empty-canvas">
              <div><strong>你的第一张商品图在这里出现</strong><span>选择配方后点击“生成 3 张本地图片”</span></div>
            </div>
          </div>
        </div>
        <div class="result-dock">
          <div class="variant-list" role="listbox" aria-label="选择生成方案"></div>
          <a class="download-button" href="#" aria-disabled="true">生成后可下载</a>
        </div>
      </section>
    </section>
  </main>
`;

const form = root.querySelector('form');
const productSelect = form.elements.product;
const uploadInput = form.elements.upload;
const titleInput = form.elements.title;
const taglineInput = form.elements.tagline;
const generateButton = root.querySelector('.generate-button');
const statusLine = root.querySelector('.status-line');
const stages = [...root.querySelectorAll('.stage-list span')];
const frame = root.querySelector('.hero-canvas-frame');
const variantList = root.querySelector('.variant-list');
const downloadButton = root.querySelector('.download-button');
const challengeButton = root.querySelector('.challenge-action');
const challengeProgress = root.querySelector('.challenge-track > span');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function wait(ms) {
  return reduceMotion ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, ms));
}

function cleanText(value, fallback, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return (text || fallback).slice(0, maxLength);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

function fillRoundRect(ctx, x, y, width, height, radius, fill) {
  roundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function setFont(ctx, weight, size, mono = false) {
  const family = mono
    ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
    : '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
  ctx.font = `${weight} ${size}px ${family}`;
}

function fitText(ctx, text, maxWidth, startSize, weight = 700) {
  let size = startSize;
  do {
    setFont(ctx, weight, size);
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 4;
  } while (size > 30);
  return size;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const chars = [...text];
  const lines = [];
  let current = '';
  for (const char of chars) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
      if (lines.length === maxLines - 1) break;
    } else current = next;
  }
  const consumed = lines.join('').length;
  if (lines.length < maxLines && consumed < chars.length) lines.push(chars.slice(consumed).join(''));
  lines.slice(0, maxLines).forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return lines.length;
}

function productRegion(format, variant) {
  const { width: w, height: h } = format;
  if (variant === 0) return { x: w * .43, y: h * .17, w: w * .46, h: h * .61 };
  if (variant === 1) return { x: w * .18, y: h * .25, w: w * .64, h: h * .55 };
  return { x: w * .09, y: h * .27, w: w * .46, h: h * .55 };
}

function drawUploadedProduct(ctx, image, region) {
  const ratio = Math.min(region.w / image.naturalWidth, region.h / image.naturalHeight);
  const width = image.naturalWidth * ratio;
  const height = image.naturalHeight * ratio;
  const x = region.x + (region.w - width) / 2;
  const y = region.y + (region.h - height) / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(20,35,28,.24)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 20;
  fillRoundRect(ctx, x - 10, y - 10, width + 20, height + 20, 28, 'rgba(255,255,255,.9)');
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 20);
  ctx.clip();
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
}

function drawSampleProduct(ctx, productId, region) {
  const centerX = region.x + region.w / 2;
  const centerY = region.y + region.h / 2;
  const scale = Math.min(region.w, region.h) / 430;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(16,31,24,.3)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 24;

  if (productId === 'perfume') {
    fillRoundRect(ctx, -132, -130, 264, 310, 32, '#14251d');
    ctx.shadowColor = 'transparent';
    fillRoundRect(ctx, -70, -195, 140, 75, 18, '#b29358');
    fillRoundRect(ctx, -90, -120, 180, 16, 8, '#2b3e34');
    ctx.fillStyle = '#f1ddad';
    ctx.textAlign = 'center';
    setFont(ctx, 650, 25, true);
    ctx.fillText('KAI No. 01', 0, 12);
    setFont(ctx, 500, 14, true);
    ctx.fillText('NIGHT / EAU DE PARFUM', 0, 44);
  } else if (productId === 'coffee') {
    ctx.beginPath();
    ctx.moveTo(-152, -190);
    ctx.lineTo(152, -190);
    ctx.lineTo(132, 188);
    ctx.quadraticCurveTo(0, 215, -132, 188);
    ctx.closePath();
    ctx.fillStyle = '#d5b784';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    fillRoundRect(ctx, -112, -72, 224, 152, 10, '#f0e5cb');
    ctx.fillStyle = '#214633';
    ctx.textAlign = 'center';
    setFont(ctx, 720, 31);
    ctx.fillText('山场', 0, -10);
    setFont(ctx, 560, 14, true);
    ctx.fillText('DRIP COFFEE / 05', 0, 25);
    ctx.beginPath();
    ctx.arc(-62, 126, 22, 0, Math.PI * 2);
    ctx.arc(0, 142, 20, 0, Math.PI * 2);
    ctx.arc(61, 122, 21, 0, Math.PI * 2);
    ctx.fillStyle = '#69462d';
    ctx.fill();
  } else {
    fillRoundRect(ctx, -188, -106, 376, 246, 52, '#253a31');
    ctx.shadowColor = 'transparent';
    fillRoundRect(ctx, -176, -94, 352, 222, 45, '#324d41');
    [-103, 0, 103].forEach((x, index) => {
      ctx.beginPath();
      ctx.arc(x, 15, index === 1 ? 65 : 52, 0, Math.PI * 2);
      ctx.fillStyle = '#15221c';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, 15, index === 1 ? 27 : 21, 0, Math.PI * 2);
      ctx.fillStyle = '#8fa195';
      ctx.fill();
    });
    ctx.fillStyle = '#dfc170';
    ctx.textAlign = 'center';
    setFont(ctx, 700, 17, true);
    ctx.fillText('KAI SOUND', 0, -62);
  }
  ctx.restore();
}

function drawProduct(ctx, region) {
  if (state.customImage) drawUploadedProduct(ctx, state.customImage, region);
  else drawSampleProduct(ctx, state.productId, region);
}

function drawBackground(ctx, width, height, variant) {
  if (variant === 0) {
    ctx.fillStyle = '#f5f0e3';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#cad9ca';
    ctx.beginPath();
    ctx.ellipse(width * .83, height * .33, width * .32, height * .38, -.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef7b61';
    ctx.beginPath();
    ctx.arc(width * .87, height * .78, width * .075, 0, Math.PI * 2);
    ctx.fill();
  } else if (variant === 1) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#dce5d6');
    gradient.addColorStop(1, '#b8c9b8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,253,245,.72)';
    ctx.beginPath();
    ctx.ellipse(width * .51, height * .54, width * .39, height * .32, .14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(25,59,46,.13)';
    ctx.lineWidth = 2;
    for (let y = 70; y < height; y += 46) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#183c2d';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ef7b61';
    ctx.beginPath();
    ctx.moveTo(width * .58, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * .7);
    ctx.closePath();
    ctx.fill();
    fillRoundRect(ctx, width * .05, height * .2, width * .51, height * .64, 38, '#f3ead7');
  }
}

function drawCopy(ctx, width, height, variant, goal) {
  const title = cleanText(state.title, '未命名商品', 18);
  const tagline = cleanText(state.tagline, '为日常留下一点好感觉', 32);
  const sourceLabel = state.customImage ? '自选图片' : '几何样例';
  const label = `${goal.label} / ${sourceLabel} / 本地合成 0${variant + 1}`;
  ctx.textBaseline = 'alphabetic';

  if (variant === 0) {
    ctx.fillStyle = '#1c4432';
    setFont(ctx, 700, Math.max(18, width * .018), true);
    ctx.fillText(label, width * .075, height * .09);
    const size = fitText(ctx, title, width * .58, width * .075, 720);
    setFont(ctx, 720, size);
    ctx.fillText(title, width * .075, height * .20);
    setFont(ctx, 500, width * .025);
    ctx.fillStyle = '#53665b';
    drawWrappedText(ctx, tagline, width * .075, height * .27, width * .42, width * .034, 2);
    ctx.strokeStyle = '#1c4432';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * .075, height * .89);
    ctx.lineTo(width * .28, height * .89);
    ctx.stroke();
  } else if (variant === 1) {
    ctx.fillStyle = '#173b2b';
    setFont(ctx, 700, width * .017, true);
    ctx.fillText(label, width * .07, height * .075);
    ctx.textAlign = 'center';
    const size = fitText(ctx, title, width * .8, width * .067, 720);
    setFont(ctx, 720, size);
    ctx.fillText(title, width * .5, height * .91);
    setFont(ctx, 520, width * .024);
    ctx.fillStyle = '#54665b';
    ctx.fillText(tagline, width * .5, height * .955);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = '#f4eddc';
    setFont(ctx, 700, width * .017, true);
    ctx.fillText(label, width * .62, height * .13);
    const titleX = width * .62;
    const titleWidth = width * .3;
    const size = fitText(ctx, title, titleWidth, width * .062, 720);
    setFont(ctx, 720, size);
    drawWrappedText(ctx, title, titleX, height * .28, titleWidth, size * 1.25, 2);
    setFont(ctx, 520, width * .025);
    ctx.fillStyle = '#f2d69a';
    drawWrappedText(ctx, tagline, titleX, height * .51, titleWidth, width * .036, 2);
    fillRoundRect(ctx, titleX, height * .75, width * .23, height * .065, height * .033, '#f3ead7');
    ctx.fillStyle = '#183c2d';
    setFont(ctx, 720, width * .018);
    ctx.textAlign = 'center';
    ctx.fillText(goal.note, titleX + width * .115, height * .792);
    ctx.textAlign = 'left';
  }
}

function createVariantCanvas(index) {
  const format = FORMATS[state.format];
  const goal = GOALS[state.goal];
  const canvas = document.createElement('canvas');
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d', { alpha: false });
  drawBackground(ctx, canvas.width, canvas.height, index);
  drawProduct(ctx, productRegion(format, index));
  drawCopy(ctx, canvas.width, canvas.height, index, goal);
  return canvas;
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片导出失败')), 'image/png');
  });
}

function cloneCanvas(source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  canvas.getContext('2d').drawImage(source, 0, 0);
  return canvas;
}

function clearVariantUrls() {
  state.variants.forEach(item => URL.revokeObjectURL(item.url));
  state.variants = [];
}

function selectVariant(index, focus = false) {
  state.selectedIndex = index;
  const selected = state.variants[index];
  if (!selected) return;
  frame.replaceChildren(cloneCanvas(selected.canvas));
  frame.classList.remove('is-fresh');
  requestAnimationFrame(() => frame.classList.add('is-fresh'));
  [...variantList.children].forEach((button, buttonIndex) => {
    button.setAttribute('aria-selected', buttonIndex === index ? 'true' : 'false');
    button.tabIndex = buttonIndex === index ? 0 : -1;
  });
  downloadButton.href = selected.url;
  downloadButton.download = `kai-commerce-${state.productId || 'product'}-${selected.id}-${state.format}.png`;
  downloadButton.textContent = `下载方案 ${selected.id.toUpperCase()} · PNG`;
  downloadButton.removeAttribute('aria-disabled');
  if (focus) variantList.children[index]?.focus();
}

function renderVariants() {
  variantList.replaceChildren();
  state.variants.forEach((item, index) => {
    const meta = VARIANTS[index];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'variant-button';
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', index === state.selectedIndex ? 'true' : 'false');
    button.tabIndex = index === state.selectedIndex ? 0 : -1;
    const preview = cloneCanvas(item.canvas);
    const copy = document.createElement('span');
    copy.innerHTML = `<strong>方案 ${item.id.toUpperCase()} · ${meta.label}</strong><span>${meta.note}</span>`;
    button.append(preview, copy);
    button.addEventListener('click', () => selectVariant(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      selectVariant((index + delta + state.variants.length) % state.variants.length, true);
    });
    variantList.append(button);
  });
  selectVariant(0);
}

function setStage(index, message) {
  stages.forEach((stage, stageIndex) => {
    stage.className = stageIndex < index ? 'is-done' : stageIndex === index ? 'is-active' : '';
  });
  statusLine.classList.remove('is-success');
  statusLine.textContent = message;
}

async function generate() {
  if (state.generating) return;
  state.generating = true;
  generateButton.disabled = true;
  generateButton.textContent = '正在绘制…';
  setStage(0, '正在整理文字、商品和画幅…');
  await wait(180);
  setStage(1, '正在把同一配方排成三种不同构图…');
  clearVariantUrls();
  try {
    const canvases = [0, 1, 2].map(createVariantCanvas);
    await wait(220);
    setStage(2, '正在导出可下载的 PNG 文件…');
    const blobs = await Promise.all(canvases.map(canvasBlob));
    state.variants = canvases.map((canvas, index) => ({
      id: VARIANTS[index].id,
      canvas,
      url: URL.createObjectURL(blobs[index])
    }));
    state.selectedIndex = 0;
    renderVariants();
    stages.forEach(stage => stage.className = 'is-done');
    statusLine.classList.add('is-success');
    statusLine.textContent = '完成：3 张图片已在本地生成。选一张喜欢的，再点击下载。';
    if (state.challenge.mode === 'live') challengeProgress.style.width = '86%';
    document.querySelector('#canvas-title')?.focus?.({ preventScroll: true });
  } catch (error) {
    statusLine.textContent = `生成失败：${error.message || '浏览器无法导出图片'}`;
  } finally {
    state.generating = false;
    generateButton.disabled = false;
    generateButton.textContent = '重新生成 3 张本地图片';
  }
}

function currentProduct() {
  return state.customImage
    ? { name: state.customName || '我的商品', tagline: '把自己的商品做成一张好看的图' }
    : PRODUCTS[state.productId];
}

function syncFormState() {
  state.goal = form.elements.goal.value;
  state.format = form.elements.format.value;
  state.title = titleInput.value;
  state.tagline = taglineInput.value;
  if (state.challenge.mode === 'live') {
    const completion = state.title.trim() && state.tagline.trim() ? 58 : 38;
    challengeProgress.style.width = `${completion}%`;
  }
}

function startChallenge() {
  if (state.challenge.timer) clearInterval(state.challenge.timer);
  state.challenge.mode = 'live';
  state.challenge.startedAt = Date.now();
  state.challenge.remaining = 60;
  challengeButton.className = 'challenge-action is-live';
  challengeButton.textContent = '还剩 01:00';
  challengeProgress.style.width = '20%';
  state.challenge.timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.challenge.startedAt) / 1000);
    state.challenge.remaining = Math.max(0, 60 - elapsed);
    const seconds = String(state.challenge.remaining).padStart(2, '0');
    challengeButton.textContent = `还剩 00:${seconds}`;
    if (state.challenge.remaining === 0) {
      clearInterval(state.challenge.timer);
      state.challenge.timer = null;
      state.challenge.mode = 'expired';
      challengeButton.className = 'challenge-action';
      challengeButton.textContent = '再试一次';
      challengeProgress.style.width = '0%';
    }
  }, 250);
}

function completeChallenge() {
  if (state.challenge.mode !== 'live') return;
  if (state.challenge.timer) clearInterval(state.challenge.timer);
  state.challenge.timer = null;
  state.challenge.mode = 'won';
  challengeProgress.style.width = '100%';
  challengeButton.className = 'challenge-action is-won';
  challengeButton.textContent = `挑战完成 · 剩 ${state.challenge.remaining} 秒`;
}

productSelect.addEventListener('change', () => {
  state.productId = productSelect.value;
  if (state.productId !== 'custom') {
    if (state.customUrl) URL.revokeObjectURL(state.customUrl);
    state.customUrl = null;
    state.customImage = null;
    productSelect.querySelector('option[value="custom"]')?.remove();
  }
  const product = currentProduct();
  titleInput.value = product.name;
  taglineInput.value = product.tagline;
  syncFormState();
});

uploadInput.addEventListener('change', async () => {
  const file = uploadInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    statusLine.textContent = '请选择 PNG、JPG 或 WebP 图片。';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    statusLine.textContent = '图片请控制在 10MB 以内。';
    return;
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  try {
    await image.decode();
    if (state.customUrl) URL.revokeObjectURL(state.customUrl);
    state.customUrl = url;
    state.customImage = image;
    state.customName = file.name.replace(/\.[^.]+$/, '').slice(0, 18) || '我的商品';
    state.productId = 'custom';
    let option = productSelect.querySelector('option[value="custom"]');
    if (!option) {
      option = document.createElement('option');
      option.value = 'custom';
      productSelect.append(option);
    }
    option.textContent = `我的图片 · ${state.customName}`;
    productSelect.value = 'custom';
    titleInput.value = state.customName;
    taglineInput.value = '把自己的商品做成一张好看的图';
    statusLine.textContent = '图片已在本机读取。现在可以继续改文案并生成。';
    syncFormState();
  } catch {
    URL.revokeObjectURL(url);
    statusLine.textContent = '这张图片无法读取，请换一张试试。';
  }
});

form.addEventListener('input', syncFormState);
form.addEventListener('change', syncFormState);
form.addEventListener('submit', event => {
  event.preventDefault();
  syncFormState();
  generate();
});

downloadButton.addEventListener('click', event => {
  if (downloadButton.getAttribute('aria-disabled') === 'true') event.preventDefault();
  else if (state.challenge.mode === 'live') {
    completeChallenge();
    statusLine.classList.add('is-success');
    statusLine.textContent = '图片已开始下载。60 秒挑战完成，也可以继续换配方再玩一次。';
  } else {
    statusLine.classList.add('is-success');
    statusLine.textContent = '图片已开始下载。可以换一套配方，再生成新的三张。';
  }
});

challengeButton.addEventListener('click', () => {
  if (state.challenge.mode !== 'live') startChallenge();
});
window.addEventListener('pagehide', () => {
  if (state.challenge.timer) clearInterval(state.challenge.timer);
  if (state.customUrl) URL.revokeObjectURL(state.customUrl);
  clearVariantUrls();
});
