import { format } from "date-fns";

import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { demoAdminOverview } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";

export default async function AdminImportsPage() {
  const session = await auth();
  const imports = await withDemoFallback(
    () =>
      prisma.importBatch.findMany({
        include: {
          client: true,
          portfolio: true,
          uploadedBy: true
        },
        orderBy: { createdAt: "desc" }
      }),
    () => demoAdminOverview.imports
  );

  return (
    <div>
      <Topbar title="Importacion inicial" description="Bootstrap de cartera desde Excel descargado manualmente de Allaria." userName={session?.user?.name ?? ""} roleLabel={session?.user?.role ?? ""} />
      <section className="mb-6 rounded-[34px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,239,229,0.84))] px-7 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Bootstrap inicial</p>
        <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#173126]">Las cargas desde Excel merecen la misma prolijidad que el resto del portal.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
          Cada importacion inicial establece el punto de partida de una cartera. Esta vista organiza ese historial con una lectura clara y sobria.
        </p>
      </section>
      <Card className="p-7">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Historial de imports</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Corridas registradas</h3>
        </div>
        <DataTable
          columns={[
            { key: "fileName", header: "Archivo" },
            { key: "client", header: "Cliente", render: (row) => row.client.displayName },
            { key: "date", header: "Valuation date", render: (row) => format(row.valuationDate, "dd/MM/yyyy") },
            { key: "status", header: "Estado", render: (row) => row.status },
            { key: "uploadedBy", header: "Subido por", render: (row) => row.uploadedBy.name }
          ]}
          data={imports.map((item) => ({ ...item, id: item.id }))}
        />
      </Card>
    </div>
  );
}
