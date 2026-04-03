import { UpdateOrigin } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function buildPublishedSnapshot(portfolioId: string, publishedById: string, sourceLabel: string) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      holdings: {
        include: {
          asset: true
        }
      }
    }
  });

  if (!portfolio) {
    throw new Error("Portfolio not found");
  }

  const totalValue = portfolio.holdings.reduce((sum, holding) => sum + Number(holding.marketValue), 0);

  const snapshot = await prisma.portfolioSnapshot.create({
    data: {
      portfolioId,
      snapshotDate: portfolio.currentAsOfDate ?? new Date(),
      totalValue,
      publishedAt: new Date(),
      publishedById,
      sourceLabel,
      positions: {
        create: portfolio.holdings.map((holding) => ({
          assetId: holding.assetId,
          quantity: holding.quantity,
          price: holding.price,
          marketValue: holding.marketValue,
          weight: totalValue === 0 ? 0 : Number(holding.marketValue) / totalValue,
          sourceOrigin: holding.updateOrigin ?? UpdateOrigin.MANUAL
        }))
      }
    }
  });

  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      visibilityStatus: "PUBLISHED",
      lastPublishedSnapshotId: snapshot.id
    }
  });

  await prisma.client.update({
    where: { id: portfolio.clientId },
    data: { lastPublishedAt: snapshot.publishedAt }
  });

  return snapshot;
}
