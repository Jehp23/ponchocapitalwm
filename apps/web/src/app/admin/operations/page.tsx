// @ts-nocheck
import { auth } from "@/auth";
import { CreateClientForm } from "@/components/admin/create-client-form";
import { CreatePortfolioForm } from "@/components/admin/create-portfolio-form";
import { RegisterMovementForm } from "@/components/admin/register-movement-form";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { demoAdminLists } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOperationsPage() {
  const session = await auth();
  const clients = await withDemoFallback(
    () =>
      prisma.client.findMany({
        select: {
          id: true,
          displayName: true
        },
        orderBy: { displayName: "asc" }
      }),
    () => demoAdminLists.clients.map((client) => ({ id: client.id, displayName: client.displayName }))
  );
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
        client: { displayName: portfolio.client.displayName }
      }))
  );
  const recentClients = clients.slice(0, 6);

  return (
    <div>
      <Topbar
        title="Operatoria"
        description="Gestion simple de clientes y carteras. Sin metricas ni ruido del dashboard."
        userName={session?.user?.name ?? ""}
        roleLabel={session?.user?.role ?? ""}
      />

      <section className="mb-6 rounded-[32px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(244,239,229,0.9))] px-6 py-6 shadow-[0_18px_50px_rgba(31,77,58,0.05)] sm:px-7 sm:py-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#7c8e85]">Operations</p>
            <h2 className="mt-3 max-w-3xl text-[34px] font-semibold tracking-[-0.05em] text-[#173126]">Un espacio corto y claro para gestionar clientes y mantener sus carteras.</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
              Esta pantalla existe para trabajar. Pocas acciones, poco texto y foco total en la operacion interna.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-white/78 p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7c8e85]">Flujo</p>
            <div className="mt-5 space-y-4">
              {[
                ["01", "Crear cliente", "#crear-cliente"],
                ["02", "Abrir portfolio", "#abrir-portfolio"],
                ["03", "Registrar movimiento", "#registrar-movimiento"]
              ].map(([step, label, href]) => (
                <Link
                  className="block rounded-[22px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))] px-4 py-4 transition hover:border-[#1f4d3a]/20 hover:bg-[#1f4d3a]/4"
                  href={href}
                  key={step}
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c8e85]">{step}</p>
                  <p className="mt-2 text-[15px] font-medium text-[#173126]">{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-mt-6" id="crear-cliente">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Alta rapida</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Nuevo cliente</h3>
          </div>
          <CreateClientForm />
        </Card>
      </section>

      <section className="mt-6 scroll-mt-6">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Clientes</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Entrar a una ficha</h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#64776d]">
              La operatoria diaria suele arrancar desde un cliente puntual. Entrando a su ficha podes revisar cartera, notas y movimientos.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recentClients.map((client) => (
              <Link
                className="rounded-[22px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.04),rgba(31,77,58,0.015))] px-4 py-4 text-[#173126] transition hover:border-[#1f4d3a]/20 hover:bg-[#1f4d3a]/4"
                href={`/admin/clients/${client.id}`}
                key={client.id}
              >
                <p className="text-[15px] font-medium">{client.displayName}</p>
                <p className="mt-1 text-[13px] text-[#66786f]">Abrir ficha del cliente</p>
              </Link>
            ))}
          </div>
          <Link className="mt-5 inline-flex rounded-[20px] border border-[#1f4d3a]/10 px-4 py-3 text-[14px] text-[#173126] transition hover:bg-[#1f4d3a]/4" href="/admin/clients">
            Ver todos los clientes
          </Link>
        </Card>
      </section>

      <section className="mt-6 scroll-mt-6" id="abrir-portfolio">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Cartera</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Abrir portfolio</h3>
          </div>
          <CreatePortfolioForm clients={clients} />
        </Card>
      </section>

      <section className="mt-6 scroll-mt-6" id="registrar-movimiento">
        <Card className="min-w-0 p-6">
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Mantenimiento</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Registrar movimiento</h3>
          </div>
          <RegisterMovementForm portfolios={portfolios} />
        </Card>
      </section>
    </div>
  );
}
