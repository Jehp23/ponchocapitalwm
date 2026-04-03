import { buildServer } from "./app";

const port = Number(process.env.API_PORT ?? 4000);

async function main() {
  const server = buildServer();

  await server.listen({
    port,
    host: "0.0.0.0"
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
