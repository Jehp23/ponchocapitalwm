import Fastify from "fastify";

import { registerHealthRoutes } from "./routes/health";
import { registerClientRoutes } from "./routes/clients";
import { registerPortfolioRoutes } from "./routes/portfolios";
import { registerImportRoutes } from "./routes/imports";
import { registerMarketDataRoutes } from "./routes/market-data";

export function buildServer() {
  const app = Fastify({
    logger: true
  });

  app.register(registerHealthRoutes, { prefix: "/health" });
  app.register(registerClientRoutes, { prefix: "/clients" });
  app.register(registerPortfolioRoutes, { prefix: "/portfolios" });
  app.register(registerImportRoutes, { prefix: "/imports" });
  app.register(registerMarketDataRoutes, { prefix: "/market-data" });

  return app;
}
