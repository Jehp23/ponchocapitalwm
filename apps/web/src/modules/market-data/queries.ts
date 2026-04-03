// @ts-nocheck

import { withDemoFallback } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";
import { DISPLAY_FX_RATES } from "@/lib/utils";

export async function getLatestAssetQuotes(assetIds: string[]) {
  const safeAssetIds = assetIds.filter((assetId): assetId is string => Boolean(assetId));

  if (safeAssetIds.length === 0) {
    return new Map<string, { price: number; asOf: Date; currency: string; changePct?: number }>();
  }

  return withDemoFallback(async () => {
    const quotes = await prisma.assetQuote.findMany({
      where: {
        assetId: {
          in: safeAssetIds
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
  }, () => new Map<string, { price: number; asOf: Date; currency: string; changePct?: number }>());
}

export async function getLatestUsdArsRate() {
  return withDemoFallback(async () => {
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
  }, () => ({
    rate: DISPLAY_FX_RATES.USD,
    asOf: new Date(),
    provider: "DEMO"
  }));
}
