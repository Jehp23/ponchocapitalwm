import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/", async () => ({
    status: "ok",
    service: "ponchocapital-wealth-portal-api"
  }));
}
