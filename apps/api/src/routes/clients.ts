import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma";

export async function registerClientRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return prisma.client.findMany({
      include: {
        advisor: true,
        portfolios: true
      },
      orderBy: { createdAt: "desc" }
    });
  });
}
