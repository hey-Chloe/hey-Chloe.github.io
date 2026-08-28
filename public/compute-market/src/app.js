import { OhlcvAggregator, PRICE_TYPES } from "./core/index.js";
import { DeterministicDemoFeed, createDeterministicDemoTicks } from "./data/index.js";

const PRODUCTS = Object.freeze({
  "GPU-A100": { code: "A100", name: "GPU-A100 算力", memory: "80 GB", basePrice: 18.6, seed: 100 },
  "GPU-H100": { code: "H100", name: "GPU-H100 算力", memory: "80 GB", basePrice: 30.8, seed: 200 },
  "GPU-H200": { code: "H200", name: "GPU-H200 算力", memory: "141 GB", basePrice: 38.4, seed: 300 },
  "GPU-B200": { code: "B200", name: "GPU-B200 算力", memory: "180 GB", basePrice: 52.0, seed: 400 },
  "GPU-B300": { code: "B300", name: "GPU-B300 算力", memory: "288 GB", basePrice: 64.0, seed: 500 },
});

const els = Object.fromEntries([
  "asset-code", "asset-name", "current-price", "price-change", "stat-high", "stat-low", "stat-open",
  "stat-volume", "price-chart", "chart-stage", "chart-tooltip", "crosshair-values", "live-price-tag",
  "quote-list", "last-updated", "toggle-stream", "connection-label", "frequency-label", "integration-dialog",
].map((id) => [id, document.getElementById(id)]));

const state = {
  symbol: "GPU-A100",
  intervalMs: 60_000,
  updatesPerSecond: 8,
  aggregator: null,
  feed: null,
  unsubscribe: null,
  lastTick: null,
  openingPrice: null,
  previousPrice: null,
  paused: false,
  renderQueued: false,
  hoverIndex: null,
  candles: [],
};

const formatPrice = (value) => Number(value).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatTime = (timestamp, withSeconds = false) => new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit", minute: "2-digit", second: withSeconds ? "2-digit" : undefined, hour12: false,
}).format(new Date(timestamp));
const formatDateTime = (timestamp) => new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
}).format(new Date(timestamp));

function buildMarket(symbol, intervalMs) {
  stopFeed();
  const product = PRODUCTS[symbol];
  const now = Date.now();
  const historyStart = now - 72 * 60 * 60 * 1000;
  const historyTicks = createDeterministicDemoTicks({
    symbol,
    seed: 20260828 + product.seed,
    count: 8_640,
    updatesPerSecond: 1 / 30,
    startTimestamp: historyStart,
    startSequence: 1,
    startPrice: product.basePrice,
    priceType: PRICE_TYPES.REFERENCE,
  });

  state.aggregator = new OhlcvAggregator({ symbol, intervalMs, maxCandles: 5_000, allowedPriceTypes: [PRICE_TYPES.REFERENCE] });
  for (const tick of historyTicks) state.aggregator.ingest(tick);
  const latestHistoryTick = historyTicks.at(-1);
  state.lastTick = latestHistoryTick;
  state.previousPrice = latestHistoryTick.price;
  state.openingPrice = historyTicks[0].price;
  state.candles = state.aggregator.query({ limit: 5_000 });

  state.feed = new DeterministicDemoFeed({
    symbol,
    seed: 20260828 + product.seed + 1,
    updatesPerSecond: state.updatesPerSecond,
    count: 100_000,
    startTimestamp: now + 125,
    startSequence: historyTicks.length + 1,
    startPrice: latestHistoryTick.price,
    priceType: PRICE_TYPES.REFERENCE,
  });
  state.unsubscribe = state.feed.subscribe(handleTick);
  if (!state.paused) state.feed.start();
  els["frequency-label"].textContent = `每秒 ${state.updatesPerSecond} 次`;
  updateProductIdentity();
  refreshUi();
}

function stopFeed() {
  if (state.feed) state.feed.stop();
  if (state.unsubscribe) state.unsubscribe();
  state.feed = null;
  state.unsubscribe = null;
}

function handleTick(tick) {
  state.previousPrice = state.lastTick?.price ?? tick.price;
  state.lastTick = tick;
  const result = state.aggregator.ingest(tick);
  if (!result.accepted) return;
  addQuoteRow(tick);
  queueRender();
}

function queueRender() {
  if (state.renderQueued) return;
  state.renderQueued = true;
  requestAnimationFrame(() => {
    state.renderQueued = false;
    refreshUi();
  });
}

function updateProductIdentity() {
  const product = PRODUCTS[state.symbol];
  els["asset-code"].textContent = product.code;
  els["asset-name"].textContent = product.name;
  document.title = `${product.code} 算力动态报价`;
  document.querySelectorAll(".product-tab").forEach((button) => {
    const selected = button.dataset.symbol === state.symbol;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
}

function refreshUi() {
  state.candles = state.aggregator.query({ limit: 5_000 });
  const visible = state.candles.slice(-72);
  const latest = visible.at(-1);
  if (!latest) return;
  const change = ((latest.close - state.openingPrice) / state.openingPrice) * 100;
  const totalUpdates = visible.reduce((sum, candle) => sum + candle.updateCount, 0);

  els["current-price"].textContent = formatPrice(latest.close);
  els["price-change"].textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  els["price-change"].classList.toggle("is-up", change >= 0);
  els["price-change"].classList.toggle("is-down", change < 0);
  els["stat-high"].textContent = formatPrice(Math.max(...visible.map((item) => item.high)));
  els["stat-low"].textContent = formatPrice(Math.min(...visible.map((item) => item.low)));
  els["stat-open"].textContent = formatPrice(visible[0].open);
  els["stat-volume"].textContent = `${totalUpdates.toLocaleString("zh-CN")} 次`;
  els["live-price-tag"].textContent = formatPrice(latest.close);
  els["last-updated"].textContent = `最后更新 ${formatTime(state.lastTick.timestamp, true)}`;
  els["connection-label"].textContent = state.paused ? "演示流已暂停" : "演示流运行中";
  drawChart();
}

function addQuoteRow(tick) {
  const row = document.createElement("li");
  const directionDown = tick.price < (state.previousPrice ?? tick.price);
  const time = document.createElement("span");
  const price = document.createElement("span");
  const type = document.createElement("span");
  time.textContent = formatTime(tick.timestamp, true);
  price.textContent = formatPrice(tick.price);
  price.className = `quote-price${directionDown ? " is-down" : ""}`;
  type.textContent = "演示";
  row.append(time, price, type);
  els["quote-list"].prepend(row);
  while (els["quote-list"].children.length > 7) els["quote-list"].lastElementChild.remove();
}

function setupCanvas() {
  const resizeObserver = new ResizeObserver(() => queueRender());
  resizeObserver.observe(els["chart-stage"]);
  els["chart-stage"].addEventListener("mousemove", handleChartHover);
  els["chart-stage"].addEventListener("mouseleave", () => {
    state.hoverIndex = null;
    els["chart-tooltip"].hidden = true;
    drawChart();
  });
}

function chartGeometry(candles) {
  const stage = els["chart-stage"];
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = els["price-chart"];
  const width = Math.max(320, rect.width);
  const height = Math.max(240, rect.height);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const margin = { top: 14, right: 64, bottom: 28, left: 8 };
  const volumeHeight = 70;
  const plotWidth = width - margin.left - margin.right;
  const priceHeight = height - margin.top - margin.bottom - volumeHeight - 12;
  const lows = candles.map((item) => item.low);
  const highs = candles.map((item) => item.high);
  const rawMin = Math.min(...lows);
  const rawMax = Math.max(...highs);
  const padding = Math.max((rawMax - rawMin) * .12, rawMax * .002);
  const minPrice = rawMin - padding;
  const maxPrice = rawMax + padding;
  const slot = plotWidth / Math.max(candles.length, 1);
  const xFor = (index) => margin.left + slot * index + slot / 2;
  const yFor = (price) => margin.top + ((maxPrice - price) / (maxPrice - minPrice)) * priceHeight;
  return { ctx, width, height, margin, volumeHeight, plotWidth, priceHeight, minPrice, maxPrice, slot, xFor, yFor };
}

function drawChart() {
  const candles = state.candles.slice(-72);
  if (!candles.length) return;
  const g = chartGeometry(candles);
  const { ctx, width, height, margin, volumeHeight, plotWidth, priceHeight, minPrice, maxPrice, slot, xFor, yFor } = g;
  ctx.clearRect(0, 0, width, height);
  ctx.font = "11px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";

  for (let line = 0; line <= 5; line += 1) {
    const y = margin.top + (priceHeight / 5) * line;
    const value = maxPrice - ((maxPrice - minPrice) / 5) * line;
    ctx.beginPath();
    ctx.strokeStyle = line === 5 ? "#cbd2d8" : "#e8ecef";
    ctx.lineWidth = 1;
    ctx.moveTo(margin.left, Math.round(y) + .5);
    ctx.lineTo(margin.left + plotWidth, Math.round(y) + .5);
    ctx.stroke();
    ctx.fillStyle = "#7d8791";
    ctx.textAlign = "left";
    ctx.fillText(formatPrice(value), margin.left + plotWidth + 8, y);
  }

  const labelStep = Math.max(1, Math.floor(candles.length / 6));
  for (let index = 0; index < candles.length; index += labelStep) {
    const x = xFor(index);
    ctx.beginPath();
    ctx.strokeStyle = "#f0f2f4";
    ctx.moveTo(Math.round(x) + .5, margin.top);
    ctx.lineTo(Math.round(x) + .5, height - margin.bottom);
    ctx.stroke();
    ctx.fillStyle = "#8b949e";
    ctx.textAlign = "center";
    ctx.fillText(formatDateTime(candles[index].time), x, height - 10);
  }

  const maxUpdates = Math.max(...candles.map((item) => item.updateCount), 1);
  candles.forEach((candle, index) => {
    const x = xFor(index);
    const up = candle.close >= candle.open;
    const color = up ? "#118567" : "#d05252";
    const bodyWidth = Math.max(2, Math.min(9, slot * .58));
    const openY = yFor(candle.open);
    const closeY = yFor(candle.close);
    const highY = yFor(candle.high);
    const lowY = yFor(candle.low);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + .5, highY);
    ctx.lineTo(Math.round(x) + .5, lowY);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillRect(x - bodyWidth / 2, Math.min(openY, closeY), bodyWidth, Math.max(1.5, Math.abs(openY - closeY)));

    const volumeTop = height - margin.bottom - (candle.updateCount / maxUpdates) * volumeHeight;
    ctx.fillStyle = up ? "rgba(17, 133, 103, .18)" : "rgba(208, 82, 82, .18)";
    ctx.fillRect(x - bodyWidth / 2, volumeTop, bodyWidth, height - margin.bottom - volumeTop);
  });

  const latest = candles.at(-1);
  const currentY = yFor(latest.close);
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(41, 86, 199, .55)";
  ctx.beginPath();
  ctx.moveTo(margin.left, currentY);
  ctx.lineTo(margin.left + plotWidth, currentY);
  ctx.stroke();
  ctx.restore();
  els["live-price-tag"].style.top = `${Math.max(12, Math.min(height - 32, currentY))}px`;

  if (state.hoverIndex !== null && candles[state.hoverIndex]) {
    const hovered = candles[state.hoverIndex];
    const x = xFor(state.hoverIndex);
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#87919b";
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, height - margin.bottom);
    ctx.stroke();
    ctx.restore();
    els["crosshair-values"].textContent = `开 ${formatPrice(hovered.open)}　高 ${formatPrice(hovered.high)}　低 ${formatPrice(hovered.low)}　收 ${formatPrice(hovered.close)}`;
  } else {
    els["crosshair-values"].textContent = `开 ${formatPrice(latest.open)}　高 ${formatPrice(latest.high)}　低 ${formatPrice(latest.low)}　收 ${formatPrice(latest.close)}`;
  }
}

function handleChartHover(event) {
  const candles = state.candles.slice(-72);
  if (!candles.length) return;
  const rect = els["chart-stage"].getBoundingClientRect();
  const plotWidth = rect.width - 72;
  const x = event.clientX - rect.left - 8;
  const index = Math.max(0, Math.min(candles.length - 1, Math.floor((x / plotWidth) * candles.length)));
  state.hoverIndex = index;
  const candle = candles[index];
  const tooltip = els["chart-tooltip"];
  tooltip.innerHTML = `<strong>${formatDateTime(candle.time)}</strong><br>开 ${formatPrice(candle.open)}　收 ${formatPrice(candle.close)}<br>高 ${formatPrice(candle.high)}　低 ${formatPrice(candle.low)}<br>报价更新 ${candle.updateCount} 次`;
  tooltip.hidden = false;
  const desiredLeft = event.clientX - rect.left + 14;
  const desiredTop = event.clientY - rect.top + 14;
  tooltip.style.left = `${Math.min(rect.width - 184, Math.max(4, desiredLeft))}px`;
  tooltip.style.top = `${Math.min(rect.height - 90, Math.max(4, desiredTop))}px`;
  drawChart();
}

function setPaused(paused) {
  state.paused = paused;
  if (paused) state.feed?.stop(); else state.feed?.start();
  els["toggle-stream"].setAttribute("aria-pressed", String(paused));
  els["toggle-stream"].querySelector("span:last-child").textContent = paused ? "继续" : "暂停";
  const badge = document.querySelector(".stream-badge");
  badge.classList.toggle("is-paused", paused);
  badge.lastChild.textContent = paused ? "已暂停" : "动态";
  els["connection-label"].textContent = paused ? "演示流已暂停" : "演示流运行中";
}

document.querySelectorAll(".product-tab").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.symbol === state.symbol) return;
    state.symbol = button.dataset.symbol;
    els["quote-list"].replaceChildren();
    buildMarket(state.symbol, state.intervalMs);
  });
});

document.querySelectorAll(".interval-button").forEach((button) => {
  button.addEventListener("click", () => {
    const intervalMs = Number(button.dataset.interval);
    if (intervalMs === state.intervalMs) return;
    state.intervalMs = intervalMs;
    document.querySelectorAll(".interval-button").forEach((item) => item.classList.toggle("is-active", item === button));
    els["quote-list"].replaceChildren();
    buildMarket(state.symbol, state.intervalMs);
  });
});

els["toggle-stream"].addEventListener("click", () => setPaused(!state.paused));

for (const id of ["open-integration", "open-integration-secondary"]) {
  document.getElementById(id).addEventListener("click", () => els["integration-dialog"].showModal());
}

els["integration-dialog"].addEventListener("click", (event) => {
  if (event.target === els["integration-dialog"]) els["integration-dialog"].close();
});

window.addEventListener("beforeunload", stopFeed);
setupCanvas();
buildMarket(state.symbol, state.intervalMs);
