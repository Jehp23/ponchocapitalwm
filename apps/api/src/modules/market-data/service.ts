// @ts-nocheck

import { prisma } from "../../lib/prisma";
import { fetchLiveQuotes, fetchUsdArsRate } from "./data912";

function normalizeTickerVariants(ticker: string) {
  const base = ticker.trim().toUpperCase();
  const variants = new Set<string>([base]);

  if (base.includes(".")) {
    variants.add(base.split(".")[0] ?? base);
  }

  return [...variants];
}

export async function syncMarketData() {
  const [assets, liveQuotes, usdArs] = await Promise.all([
    prisma.asset.findMany({
      where: {
        ticker: {
          not: null
        }
      }
    }),
    fetchLiveQuotes(),
    fetchUsdArsRate()
  ]);

  const quoteIndex = new Map<string, (typeof liveQuotes)[number]>();

  for (const quote of liveQuotes) {
    quoteIndex.set(`${quote.symbol}:${quote.currency}`, quote);
  }

  const asOf = new Date();
  let matchedAssets = 0;

  for (const asset of assets) {
    const ticker = asset.ticker?.trim();

    if (!ticker) {
      continue;
    }

    const variants = normalizeTickerVariants(ticker);
    const assetCurrency = asset.currency.toUpperCase();
    const match = variants
      .map((variant) => quoteIndex.get(`${variant}:${assetCurrency}`))
      .find((quote) => Boolean(quote));

    if (!match) {
      continue;
    }

    matchedAssets += 1;

    await prisma.assetQuote.create({
      data: {
        assetId: asset.id,
        provider: "DATA912",
        symbol: match.symbol,
        currency: match.currency,
        price: match.price,
        bid: match.bid,
        ask: match.ask,
        previousClose: match.previousClose,
        changePct: match.changePct,
        asOf,
        payload: match.payload
      }
    });
  }

  await prisma.fxRate.createMany({
    data: [
      {
        provider: "DATA912",
        baseCurrency: "USD",
        quoteCurrency: "ARS",
        rate: usdArs.rate,
        asOf,
        payload: usdArs.payload
      },
      {
        provider: "DATA912",
        baseCurrency: "ARS",
        quoteCurrency: "USD",
        rate: 1 / usdArs.rate,
        asOf,
        payload: usdArs.payload
      }
    ]
  });

  return {
    syncedAt: asOf,
    totalAssets: assets.length,
    matchedAssets,
    storedQuotes: matchedAssets,
    usdArsRate: usdArs.rate
  };
}

export async function getLatestMarketSnapshot() {
  const [latestFx, latestQuotes] = await Promise.all([
    prisma.fxRate.findMany({
      orderBy: { asOf: "desc" },
      take: 4
    }),
    prisma.assetQuote.findMany({
      orderBy: { asOf: "desc" },
      take: 20,
      include: { asset: true }
    })
  ]);

  return {
    latestFx,
    latestQuotes
  };
}
