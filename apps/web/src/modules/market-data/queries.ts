// @ts-nocheck

import { prisma } from "@/lib/prisma";

export async function getLatestAssetQuotes(assetIds: string[]) {
  if (assetIds.length === 0) {
    return new Map<string, { price: number; asOf: Date; currency: string; changePct?: number }>();
  }

  const quotes = await prisma.assetQuote.findMany({
    where: {
      assetId: {
        in: assetIds
      }
    },
    orderBy: [{ asOf: "desc" }, { createdAt: "desc" }]
  });

  const latestByAsset = new Map<string, { price: number; asOf: Date; currency: string; changePct?: number }>();

  for (const quote of quotes) {
    if (latestByAsset.has(quote.assetId)) {
      continue;
    }

    latestByAsset.set(quote.assetId, {
      price: Number(quote.price),
      asOf: quote.asOf,
      currency: quote.currency,
      changePct: quote.changePct === null ? undefined : Number(quote.changePct)
    });
  }

  return latestByAsset;
}

export async function getLatestUsdArsRate() {
  const fxRate = await prisma.fxRate.findFirst({
    where: {
      provider: {
        in: ["DATA912", "SEEDED", "MANUAL"]
      },
      baseCurrency: "USD",
      quoteCurrency: "ARS"
    },
    orderBy: [{ asOf: "desc" }, { createdAt: "desc" }]
  });

  return fxRate
    ? {
        rate: Number(fxRate.rate),
        asOf: fxRate.asOf,
        provider: fxRate.provider
      }
    : null;
}
