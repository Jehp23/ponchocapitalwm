// @ts-nocheck
import { format } from "date-fns";

import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { demoAdminOverview } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";
import Link from "next/link";

export default async function AdminTransactionsPage() {
  const session = await auth();
  const updates = await withDemoFallback(
    () =>
      prisma.manualUpdate.findMany({
        include: {
          portfolio: { include: { client: true } },
          createdBy: true,
          asset: true
        },
        orderBy: { createdAt: "desc" }
      }),
    () => demoAdminOverview.updates
  );

  return (
    <div>
      <Topbar
        title="Actualizaciones manuales"
        description="Registro interno de compras, ventas y ajustes que mantienen la cartera vigente sin ejecutar operaciones reales."
        userName={session?.user?.name ?? ""}
        roleLabel={session?.user?.role ?? ""}
      />
      <section className="mb-6 rounded-[32px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(244,239,229,0.88))] px-6 py-6 sm:px-7 sm:py-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Portfolio Maintenance</p>
            <h2 className="mt-3 max-w-2xl text-[34px] font-semibold tracking-[-0.04em] text-[#173126]">
              El registro fino que sostiene la lectura patrimonial del cliente.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
              Esta pantalla queda como historial. La carga de nuevos movimientos vive separada en Operatoria para evitar duplicaciones.
            </p>
            <Link className="mt-5 inline-flex rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/operations">
              Ir a Operatoria
            </Link>
          </div>
          <div className="rounded-[30px] border border-[#1f4d3a]/10 bg-white/78 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Resumen</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[13px] text-[#6d7f75]">Movimientos cargados</p>
                <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#173126]">{updates.length}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#6d7f75]">Ultimo movimiento</p>
                <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#173126]">{updates[0] ? format(updates[0].tradeDate ?? updates[0].effectiveDate, "dd/MM") : "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Card className="min-w-0 p-6">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Historial</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Movimientos registrados</h3>
          <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">
            Secuencia cronologica de cambios internos, util para validar consistencia y explicar la evolucion del portfolio.
          </p>
        </div>
        <DataTable
          columns={[
            { key: "title", header: "Actualizacion" },
            { key: "asset", header: "Activo", render: (row) => row.asset?.displayName ?? "-" },
            { key: "client", header: "Cliente", render: (row) => row.portfolio.client.displayName },
            { key: "type", header: "Movimiento", render: (row) => row.movementType },
            { key: "qty", header: "Cantidad", render: (row) => Number(row.quantity ?? 0).toLocaleString("es-AR") },
            { key: "date", header: "Fecha", render: (row) => format(row.tradeDate ?? row.effectiveDate, "dd/MM/yyyy") }
          ]}
          data={updates.map((update) => ({ ...update, id: update.id }))}
        />
      </Card>
    </div>
  );
}
