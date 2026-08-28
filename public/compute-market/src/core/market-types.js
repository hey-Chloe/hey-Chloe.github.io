export const PRICE_TYPES = Object.freeze({
  EXECUTED: "executed",
  MID: "midpoint",
  REFERENCE: "reference",
});

export const ALLOWED_PRICE_TYPES = Object.freeze(Object.values(PRICE_TYPES));

export const DATA_MODES = Object.freeze({
  BUSINESS: "BUSINESS",
  SANDBOX: "SANDBOX",
  DEMO: "DEMO",
});

export const ALLOWED_DATA_MODES = Object.freeze(Object.values(DATA_MODES));

export function parseInterval(interval) {
  if (Number.isInteger(interval) && interval > 0) return interval;

  const match = /^(\d+)(ms|s|m|h|d)$/.exec(String(interval ?? "").trim());
  if (!match) {
    throw new TypeError(`Unsupported interval: ${interval}`);
  }

  const value = Number(match[1]);
  const unitMs = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unitMs[match[2]];
}

export function validateTick(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("tick must be an object");
  }

  const symbol = String(input.symbol ?? "").trim().toUpperCase();
  const timestamp = Number(input.timestamp);
  const price = Number(input.price);
  const quantity = input.quantity === undefined ? 0 : Number(input.quantity);
  const sequence = Number(input.sequence);
  const priceType = String(input.priceType ?? PRICE_TYPES.EXECUTED).toLowerCase();
  const dataMode = String(input.dataMode ?? DATA_MODES.BUSINESS).toUpperCase();

  if (!symbol) throw new TypeError("tick.symbol is required");
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new TypeError("tick.timestamp must be a non-negative epoch millisecond integer");
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new TypeError("tick.price must be a finite positive number");
  }
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new TypeError("tick.quantity must be a finite non-negative number");
  }
  if (!Number.isSafeInteger(sequence) || sequence < 0) {
    throw new TypeError("tick.sequence must be a non-negative integer");
  }
  if (!ALLOWED_PRICE_TYPES.includes(priceType)) {
    throw new TypeError(`tick.priceType must be one of: ${ALLOWED_PRICE_TYPES.join(", ")}`);
  }
  if (!ALLOWED_DATA_MODES.includes(dataMode)) {
    throw new TypeError(`tick.dataMode must be one of: ${ALLOWED_DATA_MODES.join(", ")}`);
  }

  return Object.freeze({ symbol, timestamp, price, quantity, priceType, dataMode, sequence });
}

export function validateCandle(input) {
  if (!input || typeof input !== "object") throw new TypeError("candle must be an object");
  const candle = {
    ...input,
    symbol: String(input.symbol ?? "").trim().toUpperCase(),
    time: Number(input.time),
    open: Number(input.open),
    high: Number(input.high),
    low: Number(input.low),
    close: Number(input.close),
    volume: Number(input.volume ?? 0),
  };
  if (!candle.symbol) throw new TypeError("candle.symbol is required");
  if (!Number.isSafeInteger(candle.time) || candle.time < 0) {
    throw new TypeError("candle.time must be epoch milliseconds");
  }
  for (const key of ["open", "high", "low", "close"]) {
    if (!Number.isFinite(candle[key]) || candle[key] <= 0) {
      throw new TypeError(`candle.${key} must be a finite positive number`);
    }
  }
  if (candle.high < Math.max(candle.open, candle.close, candle.low)) {
    throw new RangeError("candle.high is below another OHLC value");
  }
  if (candle.low > Math.min(candle.open, candle.close, candle.high)) {
    throw new RangeError("candle.low is above another OHLC value");
  }
  if (!Number.isFinite(candle.volume) || candle.volume < 0) {
    throw new TypeError("candle.volume must be a finite non-negative number");
  }
  return Object.freeze(candle);
}
