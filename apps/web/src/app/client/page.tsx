// @ts-nocheck
import { format } from "date-fns";

import { auth } from "@/auth";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { PortfolioGrowthChart } from "@/components/charts/portfolio-growth-chart";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { convertCurrency, formatCurrency, formatPercentage } from "@/lib/utils";
import { getClientOverview } from "@/modules/dashboard/queries";
import {
  annualizePeriodicReturn,
  buildPerformanceSeries,
  buildProjectionScenarios,
  calculateAveragePeriodicReturn,
  calculateGainPercentage,
  calculatePortfolioTotalValue,
  calculateSimpleReturn
} from "@/modules/finance/calculate";

export default async function ClientDashboardPage({
  searchParams
}: Readonly<{
  searchParams?: Promise<{ currency?: string }>;
}>) {
  const session = await auth();
  const client = await getClientOverview(session?.user?.clientId ?? "");
  const params = searchParams ? await searchParams : undefined;
  const selectedCurrency = params?.currency?.toUpperCase() === "USD" ? "USD" : "ARS";

  if (!client || client.portfolios.length === 0) {
    return <div className="text-[#173126]">No hay informacion publicada para este cliente.</div>;
  }

  const portfolio = client.portfolios[0];
  const portfolioCurrency = (portfolio.baseCurrency ?? client.baseCurrency ?? "ARS").toUpperCase();
  const totalValue = calculatePortfolioTotalValue(
    portfolio.holdings.map((holding) => ({
      assetClass: holding.asset.assetClass,
      marketValue: convertCurrency(Number(holding.marketValue), holding.asset.currency ?? portfolioCurrency, selectedCurrency)
    }))
  );
  const totalUnrealizedPnl = portfolio.holdings.reduce(
    (sum, holding) => sum + convertCurrency(Number(holding.unrealizedPnl ?? 0), holding.asset.currency ?? portfolioCurrency, selectedCurrency),
    0
  );
  const totalCostBasis = portfolio.holdings.reduce(
    (sum, holding) =>
      sum + convertCurrency(Number(holding.averageCost ?? 0) * Number(holding.quantity ?? 0), holding.asset.currency ?? portfolioCurrency, selectedCurrency),
    0
  );
  const totalGainPct = calculateGainPercentage(totalValue, totalCostBasis);
  const performanceSeries = buildPerformanceSeries(
    portfolio.snapshots.map((snapshot) => ({
      snapshotDate: snapshot.snapshotDate,
      totalValue: convertCurrency(Number(snapshot.totalValue), portfolioCurrency, selectedCurrency)
    }))
  );
  const latestSnapshot = portfolio.snapshots[portfolio.snapshots.length - 1];
  const previousSnapshot = portfolio.snapshots[portfolio.snapshots.length - 2];
  const returnValue =
    latestSnapshot && previousSnapshot
      ? calculateSimpleReturn(
          convertCurrency(Number(latestSnapshot.totalValue), portfolioCurrency, selectedCurrency),
          convertCurrency(Number(previousSnapshot.totalValue), portfolioCurrency, selectedCurrency)
        )
      : 0.034;
  const averageMonthlyReturn = calculateAveragePeriodicReturn(
    portfolio.snapshots.map((snapshot) => convertCurrency(Number(snapshot.totalValue), portfolioCurrency, selectedCurrency))
  );
  const projectedAnnualReturn = annualizePeriodicReturn(averageMonthlyReturn || returnValue, 12);
  const projectionScenarios = buildProjectionScenarios(totalValue, projectedAnnualReturn);
  const assetAllocation = [...portfolio.holdings]
    .map((holding) => ({
      id: holding.id,
      name: holding.asset.displayName,
      assetClass: holding.asset.assetClass,
      marketValue: convertCurrency(Number(holding.marketValue), holding.asset.currency ?? portfolioCurrency, selectedCurrency),
      weight: totalValue > 0 ? convertCurrency(Number(holding.marketValue), holding.asset.currency ?? portfolioCurrency, selectedCurrency) / totalValue : 0
    }))
    .sort((left, right) => right.marketValue - left.marketValue);
  const positions = [...portfolio.holdings]
    .map((holding) => {
      const quantity = Number(holding.quantity ?? 0);
      const holdingCurrency = (holding.asset.currency ?? portfolioCurrency).toUpperCase();
      const averageCost = convertCurrency(Number(holding.averageCost ?? 0), holdingCurrency, selectedCurrency);
      const price = convertCurrency(Number(holding.price ?? 0), holdingCurrency, selectedCurrency);
      const marketValue = convertCurrency(Number(holding.marketValue ?? 0), holdingCurrency, selectedCurrency);
      const unrealizedPnl = convertCurrency(Number(holding.unrealizedPnl ?? 0), holdingCurrency, selectedCurrency);
      const weight = totalValue > 0 ? marketValue / totalValue : 0;
      const gainPct = calculateGainPercentage(price, averageCost);

      return {
        ...holding,
        holdingCurrency,
        quantity,
        averageCost,
        price,
        marketValue,
        unrealizedPnl,
        weight,
        gainPct
      };
    })
    .sort((left, right) => right.marketValue - left.marketValue);
  const mainPositions = assetAllocation.slice(0, 5);
  const recentMovements = [...portfolio.manualUpdates]
    .sort((left, right) => new Date(right.effectiveDate).getTime() - new Date(left.effectiveDate).getTime())
    .slice(0, 3);
  const pnlTone = totalUnrealizedPnl >= 0 ? "text-[#139862]" : "text-[#cf4455]";

  return (
    <div>
      <Topbar
        title={`Bienvenido, ${client.displayName}`}
        description="Un resumen privado y simple para ver tu patrimonio, su evolucion y en que esta invertido."
        userName={session?.user?.name ?? client.displayName}
        roleLabel="Cliente"
      />

      <section className="mb-6 rounded-[32px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(244,239,229,0.94))] px-5 py-6 shadow-[0_20px_60px_rgba(31,77,58,0.05)] sm:px-7 sm:py-7">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#7c8e85]">Resumen Patrimonial</p>
            <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.05em] text-[#173126] sm:text-[40px]">{formatCurrency(totalValue, selectedCurrency)}</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#61746a]">
              Este es el valor visible y consolidado de tu cartera al dia de hoy. Si queres, mas abajo vas a encontrar el detalle de tus posiciones.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Vista</p>
              <div className="mt-3 inline-flex rounded-full border border-[#1f4d3a]/10 bg-[#f7f4ee] p-1">
                {["ARS", "USD"].map((currency) => {
                  const active = currency === selectedCurrency;
                  return (
                    <a
                      className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                        active ? "bg-[#1f4d3a] text-white" : "text-[#476457] hover:bg-white"
                      }`}
                      href={`?currency=${currency}`}
                      key={currency}
                    >
                      {currency}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Ultima actualizacion</p>
              <p className="mt-2 text-[16px] font-medium text-[#173126]">{portfolio.currentAsOfDate ? format(portfolio.currentAsOfDate, "dd/MM/yyyy") : "-"}</p>
            </div>
            <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Variacion</p>
              <p className={`mt-2 text-[16px] font-medium ${pnlTone}`}>{formatCurrency(totalUnrealizedPnl, selectedCurrency)}</p>
            </div>
            <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Rentabilidad</p>
              <p className="mt-2 text-[16px] font-medium text-[#173126]">{formatPercentage(totalGainPct)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="min-w-0 p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Evolucion</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Como evoluciono tu cartera</h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">Un vistazo simple para ver si el patrimonio viene creciendo, estable o en retroceso.</p>
          </div>
          <PortfolioGrowthChart data={performanceSeries} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.05),rgba(31,77,58,0.02))] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Cambio reciente</p>
              <p className="mt-2 text-[18px] font-medium text-[#173126]">{formatPercentage(returnValue)}</p>
            </div>
            <div className="rounded-[22px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.05),rgba(31,77,58,0.02))] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Estado visible</p>
              <div className="mt-2">
                <Badge>{portfolio.visibilityStatus}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="min-w-0 p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Composicion</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">En que esta invertido hoy</h3>
            <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#64776d]">Primero lo mas importante: ver rapido donde esta concentrada la cartera.</p>
          </div>
          <div className="grid gap-6">
            <AllocationChart data={assetAllocation.map((item) => ({ name: item.name, value: item.marketValue }))} />
            <div className="space-y-4">
              {mainPositions.map((item) => (
                <div key={item.id}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-medium text-[#173126]">{item.name}</p>
                      <p className="text-[12px] uppercase tracking-[0.18em] text-[#7c8e85]">{item.assetClass}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-medium text-[#173126]">{formatCurrency(item.marketValue, selectedCurrency)}</p>
                      <p className="text-[13px] text-[#6d7f75]">{formatPercentage(item.weight)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 rounded-full bg-[#1f4d3a]/8">
                    <div className="h-2.5 rounded-full bg-[#1f4d3a]" style={{ width: `${Math.max(item.weight * 100, 4)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Mis inversiones</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Posiciones principales</h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">Si queres ver exactamente que tenes comprado, aca esta el detalle en un formato mas familiar de broker.</p>
          </div>
          <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-white/80">
            <table className="w-full table-auto text-left">
              <thead className="border-b border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))]">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Producto</th>
                  <th className="px-4 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Cantidad</th>
                  <th className="px-4 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Ultimo precio</th>
                  <th className="px-4 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">PPC</th>
                  <th className="px-4 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Part.</th>
                  <th className="px-4 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Gan.-Per %</th>
                  <th className="px-4 py-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Gan.-Per $</th>
                  <th className="px-5 py-4 text-right text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f4d3a]/8">
                {positions.map((position) => {
                  const pctTone = position.gainPct >= 0 ? "text-[#139862]" : "text-[#cf4455]";
                  const moneyTone = position.unrealizedPnl >= 0 ? "text-[#139862]" : "text-[#cf4455]";

                  return (
                    <tr className="bg-white/84 transition hover:bg-[#fcfbf7]" key={position.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.08),rgba(31,77,58,0.03))] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#173126]">
                            {position.asset.displayName.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-[15px] font-medium text-[#173126]">{position.asset.displayName}</p>
                            <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-[#7c8e85]">
                              {position.asset.assetClass} · {position.holdingCurrency}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[15px] text-[#173126]">{position.quantity.toLocaleString("es-AR")}</td>
                      <td className="px-4 py-4 text-[15px] text-[#173126]">{formatCurrency(position.price, selectedCurrency)}</td>
                      <td className="px-4 py-4 text-[15px] text-[#173126]">{formatCurrency(position.averageCost, selectedCurrency)}</td>
                      <td className="px-4 py-4 text-[15px] text-[#173126]">{formatPercentage(position.weight)}</td>
                      <td className={`px-4 py-4 text-[15px] font-medium ${pctTone}`}>{formatPercentage(position.gainPct)}</td>
                      <td className={`px-4 py-4 text-[15px] font-medium ${moneyTone}`}>{formatCurrency(position.unrealizedPnl, selectedCurrency)}</td>
                      <td className="px-5 py-4 text-right text-[15px] font-medium text-[#173126]">{formatCurrency(position.marketValue, selectedCurrency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="min-w-0 p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Proyeccion</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Escenarios de crecimiento</h3>
            <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#64776d]">Referencia orientativa basada en la trayectoria historica publicada.</p>
          </div>
          <div className="space-y-4">
            {projectionScenarios.map((scenario) => (
              <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))] p-4" key={scenario.label}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-medium text-[#173126]">{scenario.label}</p>
                    <p className="mt-1 text-[13px] leading-6 text-[#66786f]">Supuesto anual equivalente: {formatPercentage(scenario.annualReturn)}</p>
                  </div>
                  <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#173126]">{formatCurrency(scenario.value, selectedCurrency)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="min-w-0 p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Actividad reciente</p>
              <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Ultimas actualizaciones</h3>
            </div>
            <div className="space-y-4">
              {recentMovements.length === 0 ? (
                <p className="text-[14px] leading-6 text-[#64776d]">No hay movimientos recientes para mostrar.</p>
              ) : (
                recentMovements.map((movement) => (
                  <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))] p-4" key={movement.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[14px] font-medium text-[#173126]">{movement.title}</p>
                        <p className="mt-1 text-[13px] leading-6 text-[#66786f]">{movement.description}</p>
                      </div>
                      <p className="text-[12px] uppercase tracking-[0.18em] text-[#7c8e85]">{format(movement.effectiveDate, "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="min-w-0 p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Comentario del asesor</p>
              <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Contexto de la cartera</h3>
            </div>
            <p className="text-[15px] leading-7 text-[#476457]">{client.advisorComment ?? "Sin comentarios disponibles."}</p>
            <div className="mt-6 space-y-4">
              {client.notes.map((note) => (
                <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.05),rgba(31,77,58,0.02))] p-5" key={note.id}>
                  <p className="text-[15px] font-medium text-[#173126]">{note.title}</p>
                  <p className="mt-2 text-[14px] leading-6 text-[#5f7368]">{note.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
