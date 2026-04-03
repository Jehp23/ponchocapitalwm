// @ts-nocheck
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { CreatePortfolioForm } from "@/components/admin/create-portfolio-form";
import { RegisterMovementForm } from "@/components/admin/register-movement-form";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { demoClient } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { calculateGainPercentage, calculatePortfolioTotalValue } from "@/modules/finance/calculate";

export default async function AdminClientDetailPage({
  params
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const session = await auth();
  const { id } = await params;

  const client = await withDemoFallback(
    () =>
      prisma.client.findUnique({
        where: { id },
        include: {
          advisor: true,
          portfolios: {
            include: {
              holdings: { include: { asset: true } },
              manualUpdates: {
                include: {
                  asset: true,
                  createdBy: true
                },
                orderBy: { effectiveDate: "desc" },
                take: 8
              },
              snapshots: {
                where: { publishedAt: { not: null } },
                include: { publishedBy: true },
                orderBy: { snapshotDate: "desc" },
                take: 6
              }
            },
            orderBy: { updatedAt: "desc" }
          },
          notes: {
            include: { author: true },
            orderBy: { updatedAt: "desc" },
            take: 6
          }
        }
      }),
    () => {
      if (id !== demoClient.id) {
        return null;
      }

      return {
        ...demoClient,
        advisor: { name: "Camila Andrade" },
        portfolios: demoClient.portfolios,
        notes: demoClient.notes.map((note) => ({
          ...note,
          author: { name: "Camila Andrade" },
          visibility: "CLIENT_VISIBLE"
        }))
      };
    }
  );

  if (!client) {
    notFound();
  }

  const portfolios = client.portfolios ?? [];
  const activePortfolio = portfolios[0] ?? null;
  const clientOptions = [{ id: client.id, displayName: client.displayName }];
  const portfolioOptions = portfolios.map((portfolio) => ({
    id: portfolio.id,
    name: portfolio.name,
    client: {
      displayName: client.displayName
    }
  }));
  const totalValue = activePortfolio
    ? calculatePortfolioTotalValue(
        activePortfolio.holdings.map((holding) => ({
          assetClass: holding.asset.assetClass,
          marketValue: Number(holding.marketValue)
        }))
      )
    : 0;
  const totalCostBasis = activePortfolio
    ? activePortfolio.holdings.reduce((sum, holding) => sum + Number(holding.averageCost ?? 0) * Number(holding.quantity ?? 0), 0)
    : 0;
  const totalGainPct = calculateGainPercentage(totalValue, totalCostBasis);
  const topPositions = activePortfolio
    ? [...activePortfolio.holdings]
        .map((holding) => ({
          ...holding,
          marketValueNumber: Number(holding.marketValue),
          weight: totalValue > 0 ? Number(holding.marketValue) / totalValue : 0
        }))
        .sort((left, right) => right.marketValueNumber - left.marketValueNumber)
        .slice(0, 5)
    : [];

  return (
    <div>
      <Topbar
        title={client.displayName}
        description="Ficha operativa del cliente para entender su cartera, registrar cambios y controlar lo visible en el portal."
        userName={session?.user?.name ?? ""}
        roleLabel={session?.user?.role ?? ""}
      />

      <section className="mb-6 rounded-[32px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(244,239,229,0.9))] px-6 py-6 shadow-[0_18px_50px_rgba(31,77,58,0.05)] sm:px-7 sm:py-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#7c8e85]">Client Portfolio Desk</p>
            <h2 className="mt-3 max-w-3xl text-[34px] font-semibold tracking-[-0.05em] text-[#173126]">Todo el contexto importante del cliente, en una sola pantalla.</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
              Esta ficha resume identidad, cartera, movimientos recientes y notas del asesor para operar con criterio y sin saltos innecesarios.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Codigo</p>
                <p className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-[#173126]">{client.code}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#66786f]">Referencia interna del cliente dentro del portal.</p>
              </div>
              <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Patrimonio visible</p>
                <p className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-[#173126]">{activePortfolio ? formatCurrency(totalValue) : "-"}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#66786f]">Valor consolidado del portfolio principal.</p>
              </div>
              <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Ultima actualizacion</p>
                <p className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-[#173126]">
                  {activePortfolio?.currentAsOfDate ? format(activePortfolio.currentAsOfDate, "dd/MM/yyyy") : "-"}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#66786f]">Fecha vigente de la cartera visible.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-white/78 p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Estado general</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-[#1f4d3a]/8 pb-4">
                  <div>
                    <p className="text-[13px] text-[#6d7f75]">Asesor</p>
                    <p className="mt-1 text-[16px] font-medium text-[#173126]">{client.advisor?.name ?? "-"}</p>
                  </div>
                  <Badge>{activePortfolio?.visibilityStatus ?? "SIN PORTFOLIO"}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[13px] text-[#6d7f75]">Portfolios</p>
                    <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">{portfolios.length}</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#6d7f75]">Rentabilidad</p>
                    <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">{activePortfolio ? formatPercentage(totalGainPct) : "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-white/78 p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Acciones rapidas</p>
              <div className="mt-5 grid gap-3">
                <Link className="rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/operations">
                  Abrir operatoria
                </Link>
                <Link className="rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/imports">
                  Importar cartera inicial
                </Link>
                <Link className="rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/clients">
                  Volver al listado de clientes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Portfolios</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Estructura del cliente</h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">Vista resumida de las carteras del cliente y su estado actual dentro del portal.</p>
          </div>
          <DataTable
            columns={[
              { key: "name", header: "Portfolio", render: (row) => row.name },
              { key: "status", header: "Estado", render: (row) => <Badge>{row.visibilityStatus}</Badge> },
              { key: "positions", header: "Posiciones", render: (row) => String(row.holdings.length) },
              { key: "asOf", header: "Actualizado", render: (row) => (row.currentAsOfDate ? format(row.currentAsOfDate, "dd/MM/yyyy") : "-") }
            ]}
            data={portfolios.map((portfolio) => ({ ...portfolio, id: portfolio.id }))}
          />
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Notas del asesor</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Contexto y seguimiento</h3>
            <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#64776d]">Comentarios disponibles para complementar la lectura financiera del cliente.</p>
          </div>
          <div className="space-y-4">
            {client.notes.length === 0 ? (
              <p className="text-[14px] leading-6 text-[#64776d]">Todavia no hay notas registradas para este cliente.</p>
            ) : (
              client.notes.map((note) => (
                <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.05),rgba(31,77,58,0.02))] p-4" key={note.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-medium text-[#173126]">{note.title}</p>
                      <p className="mt-1 text-[13px] leading-6 text-[#66786f]">{note.body}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] uppercase tracking-[0.18em] text-[#7c8e85]">{note.author?.name ?? "-"}</p>
                      <p className="mt-1 text-[12px] text-[#66786f]">{note.visibility}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Posiciones</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Holdings actuales</h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">Detalle principal del portfolio para revisar concentracion, valuacion y costo promedio.</p>
          </div>
          {activePortfolio ? (
            <DataTable
              columns={[
                { key: "asset", header: "Activo", render: (row) => row.asset.displayName },
                { key: "class", header: "Clase", render: (row) => row.asset.assetClass },
                { key: "qty", header: "Cantidad", render: (row) => Number(row.quantity).toLocaleString("es-AR") },
                { key: "avg", header: "PPC", render: (row) => formatCurrency(Number(row.averageCost ?? 0)) },
                { key: "value", header: "Total", render: (row) => formatCurrency(Number(row.marketValue)) }
              ]}
              data={activePortfolio.holdings.map((holding) => ({ ...holding, id: holding.id }))}
            />
          ) : (
            <p className="text-[14px] leading-6 text-[#64776d]">Este cliente todavia no tiene un portfolio activo.</p>
          )}
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Mayores posiciones</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Concentracion actual</h3>
            <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#64776d]">Los principales pesos de cartera para leer rapido el perfil actual del portfolio.</p>
          </div>
          <div className="space-y-4">
            {topPositions.length === 0 ? (
              <p className="text-[14px] leading-6 text-[#64776d]">No hay holdings para mostrar.</p>
            ) : (
              topPositions.map((holding) => (
                <div key={holding.id}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-medium text-[#173126]">{holding.asset.displayName}</p>
                      <p className="text-[12px] uppercase tracking-[0.18em] text-[#7c8e85]">{holding.asset.assetClass}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-medium text-[#173126]">{formatCurrency(holding.marketValueNumber)}</p>
                      <p className="text-[13px] text-[#6d7f75]">{formatPercentage(holding.weight)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 rounded-full bg-[#1f4d3a]/8">
                    <div className="h-2.5 rounded-full bg-[#1f4d3a]" style={{ width: `${Math.max(holding.weight * 100, 4)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Alta y mantenimiento</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">
              {portfolios.length === 0 ? "Crear portfolio" : "Registrar movimiento"}
            </h3>
          </div>
          {portfolios.length === 0 ? <CreatePortfolioForm clients={clientOptions} /> : <RegisterMovementForm portfolios={portfolioOptions} />}
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Actividad</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Ultimos movimientos del cliente</h3>
          </div>
          <div className="space-y-4">
            {activePortfolio?.manualUpdates.length ? (
              activePortfolio.manualUpdates.map((update) => (
                <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.05),rgba(31,77,58,0.02))] p-4" key={update.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-medium text-[#173126]">{update.title}</p>
                      <p className="mt-1 text-[13px] leading-6 text-[#66786f]">{update.asset?.displayName ?? "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] uppercase tracking-[0.18em] text-[#7c8e85]">{update.movementType}</p>
                      <p className="mt-1 text-[13px] text-[#66786f]">{format(update.effectiveDate, "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[14px] leading-6 text-[#64776d]">Todavia no hay movimientos manuales registrados para este cliente.</p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
