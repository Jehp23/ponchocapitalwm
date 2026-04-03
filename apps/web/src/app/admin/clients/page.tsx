// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { demoAdminLists } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Topbar } from "@/components/layout/topbar";
import { auth } from "@/auth";
import Link from "next/link";

export default async function AdminClientsPage() {
  const session = await auth();
  const clients = await withDemoFallback(
    () =>
      prisma.client.findMany({
        include: {
          advisor: true,
          portfolios: true
        },
        orderBy: { createdAt: "desc" }
      }),
    () => demoAdminLists.clients
  );

  return (
    <div>
      <Topbar
        title="Clientes"
        description="Base simple de clientes wealth y acceso a la ficha individual de cada cartera."
        userName={session?.user?.name ?? ""}
        roleLabel={session?.user?.role ?? ""}
      />
      <section className="mb-6 rounded-[32px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(244,239,229,0.88))] px-6 py-6 sm:px-7 sm:py-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Client Registry</p>
            <h2 className="mt-3 max-w-2xl text-[34px] font-semibold tracking-[-0.04em] text-[#173126]">
              Un registro ordenado para abrir la ficha correcta y seguir trabajando sin friccion.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
              Esta pantalla no concentra la operatoria. Su objetivo es listar clientes, mostrar su estado y llevar rapido a la vista detallada.
            </p>
          </div>
          <div className="rounded-[30px] border border-[#1f4d3a]/10 bg-white/78 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Resumen</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[13px] text-[#6d7f75]">Clientes registrados</p>
                <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#173126]">{clients.length}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#6d7f75]">Con portfolio</p>
                <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#173126]">{clients.filter((client) => client.portfolios.length > 0).length}</p>
              </div>
            </div>
            <Link className="mt-5 inline-flex rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/operations">
              Ir a Operatoria
            </Link>
          </div>
        </div>
      </section>
      <Card className="min-w-0 p-6">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Base actual</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Clientes cargados</h3>
          <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">
            Vista resumida para validar rapidamente cobertura de clientes, codificacion interna y cantidad de portfolios asociados.
          </p>
        </div>
          <DataTable
            columns={[
              {
                key: "displayName",
                header: "Cliente",
                render: (row) => (
                  <Link className="font-medium text-[#173126] underline-offset-4 hover:underline" href={`/admin/clients/${row.id}`}>
                    {row.displayName}
                  </Link>
                )
              },
              { key: "code", header: "Codigo" },
              { key: "advisor", header: "Asesor", render: (row) => row.advisor?.name ?? "-" },
              { key: "portfolios", header: "Portfolios", render: (row) => String(row.portfolios.length) }
            ]}
            data={clients.map((client) => ({ ...client, id: client.id }))}
          />
      </Card>
    </div>
  );
}
