import { PRICE_TYPES, parseInterval, validateCandle, validateTick } from "./market-types.js";

function websocketBase(httpBase) {
  const url = new URL(httpBase, "http://localhost");
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString().replace(/\/$/, "");
}

function normalizePriceType(value) {
  const normalized = String(value ?? PRICE_TYPES.REFERENCE).toLowerCase();
  return normalized === "mid" ? PRICE_TYPES.MID : normalized;
}

function epochMilliseconds(value, fieldName) {
  const parsed = typeof value === "number" ? value : Date.parse(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new TypeError(`${fieldName} must be a valid timestamp`);
  return parsed;
}

function mapExternalCandle(row, { instrumentId, priceScale, priceType, dataMode }) {
  if (row.time !== undefined) return validateCandle(row);
  const scale = 10 ** priceScale;
  return validateCandle({
    symbol: instrumentId,
    time: epochMilliseconds(row.start_at, "candle.start_at"),
    endTime: epochMilliseconds(row.end_at, "candle.end_at"),
    open: Number(row.open_minor) / scale,
    high: Number(row.high_minor) / scale,
    low: Number(row.low_minor) / scale,
    close: Number(row.close_minor) / scale,
    volume: row.volume_gpu_hours === null || row.volume_gpu_hours === undefined ? 0 : Number(row.volume_gpu_hours),
    updateCount: Number(row.observation_count ?? 0),
    priceType: normalizePriceType(priceType),
    dataMode,
    isClosed: Boolean(row.is_closed),
    revision: Number(row.revision ?? 0),
    lastSequence: Number(row.last_sequence ?? 0),
  });
}

function mapExternalTick(payload, { instrumentId, priceScale }) {
  if (payload.timestamp !== undefined) return validateTick(payload);
  const scale = 10 ** priceScale;
  return validateTick({
    symbol: payload.instrument_id ?? instrumentId,
    timestamp: epochMilliseconds(payload.occurred_at, "tick.occurred_at"),
    price: Number(payload.price_minor) / scale,
    quantity: payload.quantity_gpu_hours === null || payload.quantity_gpu_hours === undefined ? 0 : Number(payload.quantity_gpu_hours),
    priceType: normalizePriceType(payload.price_type),
    dataMode: payload.data_mode,
    sequence: Number(payload.sequence),
  });
}

/** Company REST + WebSocket transport skeleton. It never prices, trades, or authenticates. */
export class MarketDataAdapter {
  constructor({ baseUrl = "", wsBaseUrl, fetchImpl = globalThis.fetch, WebSocketImpl = globalThis.WebSocket } = {}) {
    this.baseUrl = String(baseUrl).replace(/\/$/, "");
    this.wsBaseUrl = wsBaseUrl ? String(wsBaseUrl).replace(/\/$/, "") : websocketBase(this.baseUrl || globalThis.location?.origin || "http://localhost");
    this.fetchImpl = fetchImpl;
    this.WebSocketImpl = WebSocketImpl;
  }

  async getCandles({ instrumentId, symbol, interval = "1m", priceType = "REFERENCE", from, to, limit = 500, cursor, signal } = {}) {
    if (typeof this.fetchImpl !== "function") throw new Error("fetch is unavailable; inject fetchImpl");
    const normalizedInstrument = String(instrumentId ?? symbol ?? "").trim().toLowerCase();
    if (!normalizedInstrument) throw new TypeError("instrumentId is required");
    parseInterval(interval);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 2_000) {
      throw new TypeError("limit must be an integer between 1 and 2000");
    }

    const query = new URLSearchParams({
      instrument_id: normalizedInstrument,
      interval: String(interval),
      price_type: String(priceType).toUpperCase(),
      limit: String(limit),
    });
    if (from !== undefined) query.set("from", String(from));
    if (to !== undefined) query.set("to", String(to));
    if (cursor !== undefined) query.set("cursor", String(cursor));

    const response = await this.fetchImpl(`${this.baseUrl}/api/compute-market/v1/candles?${query}`, {
      signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Market history request failed (${response.status})`);
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : payload.candles;
    if (!Array.isArray(rows)) throw new TypeError("history response must contain a candles array");
    const responseInstrument = payload.instrument?.instrument_id ?? normalizedInstrument;
    const priceScale = Number(payload.instrument?.price_scale ?? 0);
    return rows.map((row) => mapExternalCandle(row, {
      instrumentId: responseInstrument,
      priceScale,
      priceType: payload.price_type ?? priceType,
      dataMode: payload.data_mode ?? "BUSINESS",
    }));
  }

  subscribe({
    instrumentId,
    symbol,
    interval = "1m",
    priceType = "REFERENCE",
    priceScale = 2,
    resumeFromSequence,
    onTick,
    onCandle = () => {},
    onStatus = () => {},
    onError = () => {},
  } = {}) {
    if (typeof this.WebSocketImpl !== "function") throw new Error("WebSocket is unavailable; inject WebSocketImpl");
    if (typeof onTick !== "function") throw new TypeError("onTick must be a function");
    const normalizedInstrument = String(instrumentId ?? symbol ?? "").trim().toLowerCase();
    if (!normalizedInstrument) throw new TypeError("instrumentId is required");
    parseInterval(interval);

    const socket = new this.WebSocketImpl(`${this.wsBaseUrl}/api/compute-market/v1/stream`);
    socket.addEventListener("open", () => {
      onStatus("open");
      const subscription = {
        op: "subscribe",
        request_id: `compute-terminal-${normalizedInstrument}`,
        channels: [{
          instrument_id: normalizedInstrument,
          price_type: String(priceType).toUpperCase(),
          interval: String(interval),
          events: ["tick", "candle"],
        }],
      };
      if (resumeFromSequence !== undefined) subscription.resume_from_sequence = resumeFromSequence;
      socket.send(JSON.stringify(subscription));
    });
    socket.addEventListener("close", () => onStatus("closed"));
    socket.addEventListener("error", (event) => onError(event));
    socket.addEventListener("message", (event) => {
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (payload.type === "heartbeat.v1") {
          onStatus("heartbeat", payload);
        } else if (payload.type === "candle.update.v1") {
          onCandle(mapExternalCandle(payload.candle, {
            instrumentId: payload.instrument_id ?? normalizedInstrument,
            priceScale,
            priceType: payload.price_type ?? priceType,
            dataMode: payload.data_mode ?? "BUSINESS",
          }));
        } else {
          onTick(mapExternalTick(payload.tick ?? payload, { instrumentId: normalizedInstrument, priceScale }));
        }
      } catch (error) {
        onError(error);
      }
    });
    return () => socket.close(1000, "client unsubscribe");
  }
}

export function createMarketDataAdapter(options) {
  return new MarketDataAdapter(options);
}
