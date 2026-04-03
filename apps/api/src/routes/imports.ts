import type { FastifyInstance } from "fastify";
import { z } from "zod";

const importPreviewSchema = z.object({
  fileName: z.string(),
  valuationDate: z.string()
});

export async function registerImportRoutes(app: FastifyInstance) {
  app.post("/preview", async (request, reply) => {
    const parsed = importPreviewSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid import preview payload",
        details: parsed.error.flatten()
      });
    }

    return {
      status: "accepted",
      fileName: parsed.data.fileName,
      valuationDate: parsed.data.valuationDate,
      message: "Import preview endpoint scaffolded. Next step: wire multipart upload and batch persistence."
    };
  });
}
