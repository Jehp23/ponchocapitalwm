import type { FastifyInstance } from "fastify";

import { getLatestMarketSnapshot, syncMarketData } from "../modules/market-data/service";

export async function registerMarketDataRoutes(app: FastifyInstance) {
  app.get("/latest", async () => {
    return getLatestMarketSnapshot();
  });

  app.post("/sync", async (request, reply) => {
    try {
      const summary = await syncMarketData();
      return summary;
    } catch (error) {
      request.log?.error?.(error);
      return reply.status(502).send({
        message: "No pudimos sincronizar market data desde Data912."
      });
    }
  });
}
