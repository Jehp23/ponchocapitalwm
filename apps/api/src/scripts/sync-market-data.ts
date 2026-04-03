import { syncMarketData } from "../modules/market-data/service";

async function main() {
  const summary = await syncMarketData();
  console.log("Market data synced:", summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
