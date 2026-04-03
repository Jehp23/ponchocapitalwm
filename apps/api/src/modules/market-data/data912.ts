const DATA912_BASE_URL = process.env.DATA912_BASE_URL ?? "https://data912.com";

type RawQuote = Record<string, unknown>;

export type NormalizedQuote = {
  symbol: string;
  currency: string;
  price: number;
  bid?: number;
  ask?: number;
  previousClose?: number;
  changePct?: number;
  payload: RawQuote;
};

type PriceEndpoint = {
  path: string;
  currency: string;
};

const PRICE_ENDPOINTS: PriceEndpoint[] = [
  { path: "/live/arg_cedears", currency: "ARS" },
  { path: "/live/arg_stocks", currency: "ARS" },
  { path: "/live/arg_bonds", currency: "ARS" },
  { path: "/live/arg_notes", currency: "ARS" },
  { path: "/live/arg_corp", currency: "ARS" },
  { path: "/live/usa_stocks", currency: "USD" },
  { path: "/live/usa_adrs", currency: "USD" }
];

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function toArray(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;

    for (const key of ["data", "items", "results", "rows"]) {
      if (Array.isArray(objectPayload[key])) {
        return objectPayload[key] as unknown[];
      }
    }
  }

  return [];
}

async function fetchJson(path: string) {
  const response = await fetch(`${DATA912_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Data912 request failed for ${path}: ${response.status}`);
  }

  return response.json();
}

function normalizeSymbol(rawQuote: RawQuote) {
  const symbol = rawQuote.symbol ?? rawQuote.ticker ?? rawQuote.ticker_ar ?? rawQuote.ticker_usa;
  return typeof symbol === "string" ? symbol.trim().toUpperCase() : undefined;
}

function normalizeQuote(rawQuote: RawQuote, fallbackCurrency: string): NormalizedQuote | null {
  const symbol = normalizeSymbol(rawQuote);
  const price = toNumber(rawQuote.c ?? rawQuote.close ?? rawQuote.mark ?? rawQuote.CCL_mark);

  if (!symbol || price === undefined) {
    return null;
  }

  return {
    symbol,
    currency: fallbackCurrency,
    price,
    bid: toNumber(rawQuote.px_bid ?? rawQuote.bid ?? rawQuote.ars_bid ?? rawQuote.usd_bid),
    ask: toNumber(rawQuote.px_ask ?? rawQuote.ask ?? rawQuote.ars_ask ?? rawQuote.usd_ask),
    previousClose: toNumber(rawQuote.close ?? rawQuote.CCL_close),
    changePct: toNumber(rawQuote.pct_change),
    payload: rawQuote
  };
}

export async function fetchLiveQuotes() {
  const responses = await Promise.all(
    PRICE_ENDPOINTS.map(async (endpoint) => {
      const payload = await fetchJson(endpoint.path);
      const quotes = toArray(payload)
        .map((item) => (typeof item === "object" && item ? normalizeQuote(item as RawQuote, endpoint.currency) : null))
        .filter((item): item is NormalizedQuote => Boolean(item));

      return {
        endpoint: endpoint.path,
        quotes
      };
    })
  );

  return responses.flatMap((response) => response.quotes);
}

export async function fetchUsdArsRate() {
  const payload = await fetchJson("/live/mep");
  const rows = toArray(payload);
  const firstRow = rows.find((item) => item && typeof item === "object") as RawQuote | undefined;

  if (!firstRow) {
    throw new Error("Data912 MEP payload did not contain rows");
  }

  const rate = toNumber(firstRow.mark ?? firstRow.close ?? firstRow.ask ?? firstRow.bid);

  if (rate === undefined) {
    throw new Error("Data912 MEP payload did not contain a usable FX rate");
  }

  return {
    rate,
    payload: firstRow
  };
}
