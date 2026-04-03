import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma";

export async function registerPortfolioRoutes(app: FastifyInstance) {
  app.get("/:portfolioId", async (request) => {
    const { portfolioId } = request.params as { portfolioId: string };

    return prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        client: true,
        holdings: {
          include: {
            asset: true
          }
        },
        snapshots: {
          include: {
            positions: {
              include: {
                asset: true
              }
            }
          },
          orderBy: {
            snapshotDate: "desc"
          }
        },
        manualUpdates: true,
        notes: true
      }
    });
  });
}
