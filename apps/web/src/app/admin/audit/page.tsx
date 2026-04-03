// @ts-nocheck
import { format } from "date-fns";

import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { demoAdminLists } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";

export default async function AdminAuditPage() {
  const session = await auth();
  const logs = await withDemoFallback(
    () =>
      prisma.auditLog.findMany({
        include: {
          actor: true,
          client: true
        },
        orderBy: { createdAt: "desc" }
      }),
    () => demoAdminLists.logs
  );

  return (
    <div>
      <Topbar title="Auditoria" description="Registro de eventos importantes para trazabilidad operativa y reputacional." userName={session?.user?.name ?? ""} roleLabel={session?.user?.role ?? ""} />
      <section className="mb-6 rounded-[34px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,239,229,0.84))] px-7 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Traceability</p>
        <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#173126]">Una pista clara de cada accion relevante sobre la cartera.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
          La trazabilidad no deberia sentirse como un modulo tecnico separado, sino como una capa natural de confianza operativa.
        </p>
      </section>
      <Card className="p-7">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Registro de eventos</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Auditoria reciente</h3>
        </div>
        <DataTable
          columns={[
            { key: "action", header: "Accion" },
            { key: "entityType", header: "Entidad" },
            { key: "client", header: "Cliente", render: (row) => row.client?.displayName ?? "-" },
            { key: "actor", header: "Actor", render: (row) => row.actor?.name ?? "-" },
            { key: "date", header: "Fecha", render: (row) => format(row.createdAt, "dd/MM/yyyy HH:mm") }
          ]}
          data={logs.map((log) => ({ ...log, id: log.id }))}
        />
      </Card>
    </div>
  );
}
