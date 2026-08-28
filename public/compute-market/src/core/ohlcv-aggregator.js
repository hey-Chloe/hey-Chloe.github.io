import { PRICE_TYPES, parseInterval, validateTick } from "./market-types.js";

function eventOrder(tick) {
  return [tick.timestamp, tick.sequence];
}

function isBefore(left, right) {
  return left[0] < right[0] || (left[0] === right[0] && left[1] < right[1]);
}

function isAfter(left, right) {
  return left[0] > right[0] || (left[0] === right[0] && left[1] > right[1]);
}

function publicCandle(candle) {
  const { _firstEvent, _lastEvent, _priceTypes, _dataModes, ...visible } = candle;
  return Object.freeze({
    ...visible,
    priceType: _priceTypes.size === 1 ? [..._priceTypes][0] : "mixed",
    dataMode: _dataModes.size === 1 ? [..._dataModes][0] : "MIXED",
    priceTypeCounts: Object.freeze({ ...visible.priceTypeCounts }),
  });
}

/**
 * Event-time OHLCV aggregation for a single product.
 *
 * OHLC uses every accepted price tick. `volume`, `quoteVolume`, and
 * `tradeCount` use executed ticks only; mid/reference quantities are not trades.
 * Out-of-order ticks are accepted and open/close are repaired by event time.
 */
export class OhlcvAggregator {
  constructor({ symbol, intervalMs, maxCandles = 2_000, allowedPriceTypes } = {}) {
    this.symbol = String(symbol ?? "").trim().toUpperCase();
    if (!this.symbol) throw new TypeError("symbol is required");
    this.intervalMs = parseInterval(intervalMs);
    if (!Number.isSafeInteger(maxCandles) || maxCandles < 1) {
      throw new TypeError("maxCandles must be a positive integer");
    }
    this.maxCandles = maxCandles;
    this.allowedPriceTypes = allowedPriceTypes ? new Set(allowedPriceTypes) : null;
    this._candles = new Map();
    this._seenSequences = new Set();
    this._latestEvent = null;
  }

  ingest(input) {
    const tick = validateTick(input);
    if (tick.symbol !== this.symbol) {
      return Object.freeze({
        accepted: false,
        reason: "SYMBOL_MISMATCH",
        candle: null,
        isNewCandle: false,
        outOfOrder: false,
      });
    }
    if (this.allowedPriceTypes && !this.allowedPriceTypes.has(tick.priceType)) {
      return Object.freeze({
        accepted: false,
        reason: "PRICE_TYPE_FILTERED",
        candle: null,
        isNewCandle: false,
        outOfOrder: false,
      });
    }
    if (this._seenSequences.has(tick.sequence)) {
      return Object.freeze({
        accepted: false,
        reason: "DUPLICATE_SEQUENCE",
        candle: null,
        isNewCandle: false,
        outOfOrder: false,
      });
    }

    const order = eventOrder(tick);
    const outOfOrder = this._latestEvent !== null && isBefore(order, this._latestEvent);
    if (this._latestEvent === null || isAfter(order, this._latestEvent)) this._latestEvent = order;
    this._seenSequences.add(tick.sequence);

    const time = Math.floor(tick.timestamp / this.intervalMs) * this.intervalMs;
    const isNewCandle = !this._candles.has(time);
    const executed = tick.priceType === PRICE_TYPES.EXECUTED;
    let candle = this._candles.get(time);

    if (!candle) {
      candle = {
        symbol: this.symbol,
        time,
        endTime: time + this.intervalMs,
        open: tick.price,
        high: tick.price,
        low: tick.price,
        close: tick.price,
        volume: executed ? tick.quantity : 0,
        quoteVolume: executed ? tick.price * tick.quantity : 0,
        tradeCount: executed ? 1 : 0,
        updateCount: 1,
        priceTypeCounts: Object.fromEntries(
          Object.values(PRICE_TYPES).map((priceType) => [priceType, tick.priceType === priceType ? 1 : 0]),
        ),
        _firstEvent: order,
        _lastEvent: order,
        _priceTypes: new Set([tick.priceType]),
        _dataModes: new Set([tick.dataMode]),
      };
      this._candles.set(time, candle);
    } else {
      candle.high = Math.max(candle.high, tick.price);
      candle.low = Math.min(candle.low, tick.price);
      candle.updateCount += 1;
      candle._priceTypes.add(tick.priceType);
      candle._dataModes.add(tick.dataMode);
      candle.priceTypeCounts[tick.priceType] += 1;
      if (executed) {
        candle.volume += tick.quantity;
        candle.quoteVolume += tick.price * tick.quantity;
        candle.tradeCount += 1;
      }
      if (isBefore(order, candle._firstEvent)) {
        candle.open = tick.price;
        candle._firstEvent = order;
      }
      if (isAfter(order, candle._lastEvent)) {
        candle.close = tick.price;
        candle._lastEvent = order;
      }
    }

    this._prune();
    return Object.freeze({
      accepted: true,
      reason: null,
      candle: publicCandle(candle),
      isNewCandle,
      outOfOrder,
    });
  }

  query({ limit = this.maxCandles, from, to } = {}) {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new TypeError("limit must be a positive integer");
    return [...this._candles.values()]
      .filter((candle) => (from === undefined || candle.time >= from) && (to === undefined || candle.time < to))
      .sort((left, right) => left.time - right.time)
      .slice(-limit)
      .map(publicCandle);
  }

  reset() {
    this._candles.clear();
    this._seenSequences.clear();
    this._latestEvent = null;
  }

  _prune() {
    if (this._candles.size <= this.maxCandles) return;
    const times = [...this._candles.keys()].sort((a, b) => a - b);
    for (const time of times.slice(0, this._candles.size - this.maxCandles)) {
      this._candles.delete(time);
    }
  }
}
