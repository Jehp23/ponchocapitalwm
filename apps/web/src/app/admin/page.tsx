// @ts-nocheck
import { format } from "date-fns";

import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { demoAdminLists } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";
import { getAdminOverview } from "@/modules/dashboard/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const overview = await getAdminOverview();
  const portfolios = await withDemoFallback(
    () =>
      prisma.portfolio.findMany({
        include: {
          client: true
        },
        orderBy: { updatedAt: "desc" }
      }),
    () =>
      demoAdminLists.portfolios.map((portfolio) => ({
        ...portfolio,
        clientId: "demo-client",
        client: { displayName: portfolio.client.displayName }
      }))
  );

  const clientsWithoutPortfolio = Math.max(overview.clients - overview.portfolios, 0);
  const pendingPublication = Math.max(overview.updates.length - overview.snapshots.length, 0);
  const latestSnapshotDate = overview.snapshots[0]?.snapshotDate;
  const latestImportDate = overview.imports[0]?.valuationDate;

  return (
    <div>
      <Topbar
        title="Dashboard asesor"
        description="Un tablero ejecutivo y liviano para entender el estado del portal en pocos segundos."
        userName={session?.user?.name ?? "Admin"}
        roleLabel={session?.user?.role ?? "ADMIN"}
      />

      <section className="mb-6 isolate overflow-hidden rounded-[32px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(244,239,229,0.9))] px-6 py-6 shadow-[0_18px_50px_rgba(31,77,58,0.05)] sm:px-7 sm:py-7">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#7c8e85]">Advisor Desk</p>
            <h2 className="mt-3 max-w-3xl text-[34px] font-semibold tracking-[-0.05em] text-[#173126]">Un panel simple para ver rapido clientes, carteras y pendientes.</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
              Este dashboard es solo lectura. La carga y el mantenimiento viven separados en Operatoria para evitar ruido visual.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Clientes activos</p>
                <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#173126]">{overview.clients}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#66786f]">Base actual dentro del portal wealth.</p>
              </div>
              <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Portfolios</p>
                <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#173126]">{overview.portfolios}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#66786f]">Carteras creadas para seguimiento y visualizacion.</p>
              </div>
              <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Sin portfolio</p>
                <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#173126]">{clientsWithoutPortfolio}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#66786f]">Clientes que todavia no tienen una cartera abierta.</p>
              </div>
              <div className="rounded-[26px] border border-[#1f4d3a]/10 bg-white/78 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Por publicar</p>
                <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#173126]">{pendingPublication}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#66786f]">Cambios internos que aun no llegaron al portal cliente.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-white/78 p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Lectura rapida</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))] p-4">
                  <p className="text-[14px] font-medium text-[#173126]">Pendientes de carga</p>
                  <p className="mt-2 text-[13px] leading-6 text-[#66786f]">
                    {clientsWithoutPortfolio > 0
                      ? `${clientsWithoutPortfolio} cliente${clientsWithoutPortfolio === 1 ? "" : "s"} aun sin portfolio cargado.`
                      : "Todos los clientes actuales ya tienen una cartera asociada."}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))] p-4">
                  <p className="text-[14px] font-medium text-[#173126]">Publicacion cliente</p>
                  <p className="mt-2 text-[13px] leading-6 text-[#66786f]">
                    {pendingPublication > 0
                      ? `${pendingPublication} cambio${pendingPublication === 1 ? "" : "s"} podria${pendingPublication === 1 ? "" : "n"} requerir publicacion o revision.`
                      : "No hay diferencias evidentes entre los cambios cargados y los snapshots visibles."}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))] p-4">
                  <p className="text-[14px] font-medium text-[#173126]">Ultima actividad</p>
                  <p className="mt-2 text-[13px] leading-6 text-[#66786f]">
                    {latestImportDate
                      ? `Ultima carga registrada: ${format(latestImportDate, "dd/MM/yyyy")}.`
                      : latestSnapshotDate
                        ? `Ultimo snapshot publicado: ${format(latestSnapshotDate, "dd/MM/yyyy")}.`
                        : "Todavia no hay actividad publicada."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-white/78 p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Acciones rapidas</p>
              <div className="mt-5 grid gap-3">
                <Link className="rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/operations">
                  Abrir Operatoria
                </Link>
                <Link className="rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/clients">
                  Ver clientes
                </Link>
                <Link className="rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/imports">
                  Revisar imports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Clientes recientes</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Acceso directo a clientes</h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">Entradas rapidas para abrir la ficha correcta y seguir trabajando sin navegar de mas.</p>
          </div>
          <DataTable
            columns={[
              {
                key: "client",
                header: "Cliente",
                render: (row) => (
                  <Link className="font-medium text-[#173126] underline-offset-4 hover:underline" href={`/admin/clients/${row.clientId}`}>
                    {row.client.displayName}
                  </Link>
                )
              },
              { key: "portfolio", header: "Portfolio", render: (row) => row.name },
              { key: "status", header: "Estado", render: (row) => <Badge>{row.visibilityStatus}</Badge> },
              { key: "positions", header: "Posiciones", render: (row) => String(row.holdings.length) }
            ]}
            data={portfolios.slice(0, 6).map((portfolio) => ({ ...portfolio, id: portfolio.id, clientId: portfolio.clientId }))}
          />
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Publicacion</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Versiones visibles recientes</h3>
            <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#64776d]">Lo ultimo que ya paso a formar parte de la experiencia del cliente.</p>
          </div>
          <DataTable
            columns={[
              { key: "client", header: "Cliente", render: (row) => row.portfolio.client.displayName },
              { key: "portfolio", header: "Portfolio", render: (row) => row.portfolio.name },
              { key: "date", header: "Snapshot", render: (row) => format(row.snapshotDate, "dd/MM/yyyy") },
              { key: "author", header: "Publicado por", render: (row) => row.publishedBy?.name ?? "-" }
            ]}
            data={overview.snapshots.slice(0, 6).map((snapshot) => ({ ...snapshot, id: snapshot.id }))}
          />
        </Card>
      </section>

      <section className="mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Carga inicial</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Imports recientes</h3>
            <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#64776d]">Solo para referencia. La carga operativa diaria vive separada en Operatoria.</p>
          </div>
          <div className="space-y-4">
            {overview.imports.slice(0, 4).map((batch) => (
              <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.05),rgba(31,77,58,0.02))] p-4" key={batch.id}>
                <p className="text-[14px] font-medium text-[#173126]">{batch.client.displayName}</p>
                <p className="mt-1 text-[13px] leading-6 text-[#66786f]">{batch.fileName}</p>
                <p className="mt-2 text-[12px] uppercase tracking-[0.18em] text-[#7c8e85]">
                  {format(batch.valuationDate, "dd/MM/yyyy")} · {batch.status}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
