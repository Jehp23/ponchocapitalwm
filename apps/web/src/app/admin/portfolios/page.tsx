// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { demoAdminLists } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Topbar } from "@/components/layout/topbar";
import { auth } from "@/auth";
import Link from "next/link";

export default async function AdminPortfoliosPage() {
  const session = await auth();
  const portfolios = await withDemoFallback(
    () =>
      prisma.portfolio.findMany({
        include: {
          client: true,
          holdings: {
            include: {
              asset: true
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      }),
    () => demoAdminLists.portfolios
  );

  return (
    <div>
      <Topbar title="Portfolios" description="Estado vigente editable antes de publicar una nueva version al cliente." userName={session?.user?.name ?? ""} roleLabel={session?.user?.role ?? ""} />
      <section className="mb-6 rounded-[34px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,239,229,0.84))] px-7 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Portfolio registry</p>
        <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#173126]">Una vista limpia del estado vigente de cada cartera.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
          Esta pantalla queda como referencia. La apertura de carteras y la carga operativa diaria viven separadas en Operatoria.
        </p>
        <Link className="mt-5 inline-flex rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/operations">
          Ir a Operatoria
        </Link>
      </section>
      <Card className="p-7">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Estado vigente</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Portfolios cargados</h3>
        </div>
        <DataTable
          columns={[
            { key: "name", header: "Portfolio" },
            { key: "client", header: "Cliente", render: (row) => row.client.displayName },
            { key: "status", header: "Estado", render: (row) => row.visibilityStatus },
            { key: "holdings", header: "Posiciones", render: (row) => String(row.holdings.length) }
          ]}
          data={portfolios.map((portfolio) => ({ ...portfolio, id: portfolio.id }))}
        />
      </Card>
      <Card className="mt-6 p-7">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Holdings</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Posiciones vigentes por portfolio</h3>
        </div>
        <DataTable
          columns={[
            { key: "portfolio", header: "Portfolio", render: (row) => row.portfolioName },
            { key: "asset", header: "Activo", render: (row) => row.assetName },
            { key: "quantity", header: "Cantidad" },
            { key: "avgCost", header: "Costo prom." },
            { key: "value", header: "Valuacion" },
            { key: "pnl", header: "P&L no realizado" }
          ]}
          data={portfolios
            .flatMap((portfolio) =>
              portfolio.holdings.map((holding, index) => ({
                id: `${portfolio.id}-${index}`,
                portfolioName: portfolio.name,
                assetName: "asset" in holding ? holding.asset.displayName : "Activo",
                quantity: Number(holding.quantity ?? 0).toLocaleString("es-AR"),
                avgCost: Number(holding.averageCost ?? 0).toLocaleString("es-AR"),
                value: Number(holding.marketValue ?? 0).toLocaleString("es-AR"),
                pnl: Number(holding.unrealizedPnl ?? 0).toLocaleString("es-AR")
              }))
            )
            .slice(0, 12)}
        />
      </Card>
    </div>
  );
}
