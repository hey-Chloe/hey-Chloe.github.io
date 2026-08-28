import { DATA_MODES, PRICE_TYPES, validateTick } from "../core/market-types.js";

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function symbolBasePrice(symbol) {
  const prices = { A100: 8.68, H100: 15.86, H200: 19.2, B200: 24.8, B300: 30.6, "GPU-A10": 3.82 };
  return prices[symbol] ?? 5;
}

export function createDeterministicDemoTicks({
  symbol = "GPU-A10",
  seed = 20260828,
  count = 1_000,
  updatesPerSecond = 12,
  startTimestamp = Date.UTC(2026, 7, 28, 1, 30, 0),
  startSequence = 1,
  startPrice,
  priceType = PRICE_TYPES.REFERENCE,
  dataMode = DATA_MODES.DEMO,
} = {}) {
  const normalizedSymbol = String(symbol).trim().toUpperCase();
  if (!Number.isSafeInteger(seed)) throw new TypeError("seed must be an integer");
  if (!Number.isSafeInteger(count) || count < 1) throw new TypeError("count must be a positive integer");
  if (!Number.isFinite(updatesPerSecond) || updatesPerSecond <= 0) throw new TypeError("updatesPerSecond must be positive");
  const random = mulberry32(seed);
  const stepMs = 1_000 / updatesPerSecond;
  let price = Number(startPrice ?? symbolBasePrice(normalizedSymbol));
  const ticks = [];

  for (let index = 0; index < count; index += 1) {
    const cyclicalDrift = Math.sin(index / 37) * 0.00055;
    const noise = (random() - 0.5) * 0.0032;
    price = Math.max(0.01, price * (1 + cyclicalDrift + noise));
    const quantity = priceType === PRICE_TYPES.EXECUTED ? 1 + Math.floor(random() * 24) : 0;
    ticks.push(validateTick({
      symbol: normalizedSymbol,
      timestamp: Math.round(startTimestamp + index * stepMs),
      price: Number(price.toFixed(4)),
      quantity,
      priceType,
      dataMode,
      sequence: startSequence + index,
    }));
  }
  return Object.freeze(ticks);
}

export class DeterministicDemoFeed {
  constructor({ symbol = "GPU-A10", seed = 20260828, updatesPerSecond = 12, count = 100_000, ...options } = {}) {
    if (!Number.isFinite(updatesPerSecond) || updatesPerSecond <= 0) throw new TypeError("updatesPerSecond must be positive");
    this.symbol = String(symbol).trim().toUpperCase();
    this.seed = seed;
    this.updatesPerSecond = updatesPerSecond;
    this._ticks = createDeterministicDemoTicks({ symbol: this.symbol, seed, updatesPerSecond, count, ...options });
    this._index = 0;
    this._listeners = new Set();
    this._timer = null;
  }

  subscribe(onTick) {
    if (typeof onTick !== "function") throw new TypeError("onTick must be a function");
    this._listeners.add(onTick);
    return () => this._listeners.delete(onTick);
  }

  start() {
    if (this._timer !== null) return;
    const periodMs = Math.max(4, Math.round(1_000 / this.updatesPerSecond));
    this._timer = setInterval(() => this.emitNext(), periodMs);
  }

  stop() {
    if (this._timer === null) return;
    clearInterval(this._timer);
    this._timer = null;
  }

  reset() {
    this.stop();
    this._index = 0;
  }

  emitNext() {
    if (this._index >= this._ticks.length) this._index = 0;
    const tick = this._ticks[this._index];
    this._index += 1;
    for (const listener of this._listeners) listener(tick);
    return tick;
  }

  get running() {
    return this._timer !== null;
  }
}
