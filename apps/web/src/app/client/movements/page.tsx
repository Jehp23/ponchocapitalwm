// @ts-nocheck
import { format } from "date-fns";

import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getClientOverview } from "@/modules/dashboard/queries";

export default async function ClientMovementsPage() {
  const session = await auth();
  const client = await getClientOverview(session?.user?.clientId ?? "");
  const portfolio = client?.portfolios[0];

  return (
    <div>
      <Topbar title="Actualizaciones visibles" description="Historial de cambios y publicaciones comunicados al cliente." userName={session?.user?.name ?? ""} roleLabel="Cliente" />
      <section className="mb-6 rounded-[34px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,239,229,0.84))] px-7 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Actividad de cartera</p>
        <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#173126]">Movimientos visibles para tu seguimiento.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
          Esta vista resume los cambios relevantes informados por PonchoCapital para mantener una lectura clara de la evolucion operativa.
        </p>
      </section>
      <Card className="p-6">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Historial visible</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Registro de movimientos</h3>
        </div>
        <DataTable
          columns={[
            { key: "title", header: "Actualizacion" },
            { key: "asset", header: "Activo", render: (row) => row.asset?.displayName ?? "-" },
            { key: "type", header: "Movimiento", render: (row) => row.movementType },
            { key: "date", header: "Trade date", render: (row) => format(row.tradeDate ?? row.effectiveDate, "dd/MM/yyyy") },
            { key: "quantity", header: "Cantidad", render: (row) => Number(row.quantity ?? 0).toLocaleString("es-AR") },
            { key: "price", header: "Precio", render: (row) => Number(row.price ?? 0).toLocaleString("es-AR") },
            { key: "description", header: "Detalle", render: (row) => row.description ?? "-" }
          ]}
          data={(portfolio?.manualUpdates.filter((update) => update.visibleToClient) ?? []).map((update) => ({ ...update, id: update.id }))}
        />
      </Card>
    </div>
  );
}
