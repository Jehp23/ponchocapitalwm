import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercentage(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    maximumFractionDigits: 2
  }).format(value);
}

export type FxRateMap = Record<string, number>;

export const DISPLAY_FX_RATES: FxRateMap = {
  ARS: 1,
  USD: 1100
};

export function convertCurrency(value: number, fromCurrency = "ARS", toCurrency = "ARS", fxRates: FxRateMap = DISPLAY_FX_RATES) {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const fromRate = fxRates[from];
  const toRate = fxRates[to];

  if (!fromRate || !toRate) {
    return value;
  }

  const valueInArs = from === "ARS" ? value : value * fromRate;
  return to === "ARS" ? valueInArs : valueInArs / toRate;
}

export function buildFxRateMap(latestUsdArs?: number) {
  if (!latestUsdArs || !Number.isFinite(latestUsdArs) || latestUsdArs <= 0) {
    return DISPLAY_FX_RATES;
  }

  return {
    ARS: 1,
    USD: latestUsdArs
  } satisfies FxRateMap;
}
