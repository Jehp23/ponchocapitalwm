// @ts-nocheck
import { demoAdminOverview, demoClient } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  return withDemoFallback(async () => {
    const [clients, portfolios, imports, snapshots, updates, notes] = await Promise.all([
      prisma.client.count(),
      prisma.portfolio.count(),
      prisma.importBatch.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: true, portfolio: true }
      }),
      prisma.portfolioSnapshot.findMany({
        where: {
          publishedAt: {
            not: null
          }
        },
        orderBy: { publishedAt: "desc" },
        take: 6,
        include: { portfolio: { include: { client: true } }, publishedBy: true }
      }),
      prisma.manualUpdate.findMany({
        orderBy: { effectiveDate: "desc" },
        take: 5,
        include: { portfolio: { include: { client: true } }, createdBy: true }
      }),
      prisma.advisorNote.findMany({
        where: { visibility: "CLIENT_VISIBLE" },
        orderBy: { publishedAt: "desc" },
        take: 4,
        include: { client: true, author: true }
      })
    ]);

    return { clients, portfolios, imports, snapshots, updates, notes };
  }, () => demoAdminOverview);
}

export async function getClientOverview(clientId: string) {
  return withDemoFallback(
    async () =>
      prisma.client.findUnique({
        where: { id: clientId },
        include: {
          notes: {
            where: { visibility: "CLIENT_VISIBLE" },
            orderBy: { publishedAt: "desc" },
            take: 3
          },
          portfolios: {
            include: {
              holdings: { include: { asset: true } },
              snapshots: {
                orderBy: { snapshotDate: "asc" },
                where: {
                  publishedAt: {
                    not: null
                  }
                },
                include: {
                  positions: {
                    include: { asset: true }
                  }
                }
              },
              manualUpdates: {
                orderBy: { effectiveDate: "desc" },
                take: 10,
                include: { createdBy: true, asset: true }
              }
            }
          }
        }
      }),
    () => (clientId === demoClient.id || !clientId ? demoClient : null)
  );
}
