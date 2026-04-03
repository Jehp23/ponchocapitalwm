import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { demoAdminLists } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await withDemoFallback(
    () =>
      prisma.user.findMany({
        orderBy: { createdAt: "desc" }
      }),
    () => demoAdminLists.users
  );

  return (
    <div>
      <Topbar title="Usuarios" description="Gestion basica de credenciales y roles para portal cliente y asesores." userName={session?.user?.name ?? ""} roleLabel={session?.user?.role ?? ""} />
      <section className="mb-6 rounded-[34px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,239,229,0.84))] px-7 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Access & identity</p>
        <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#173126]">Usuarios y roles con una lectura simple y profesional.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
          Esta vista concentra las identidades que ingresan al portal, manteniendo clara la diferencia entre equipo interno y clientes finales.
        </p>
      </section>
      <Card className="p-7">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Usuarios del portal</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Accesos habilitados</h3>
        </div>
        <DataTable
          columns={[
            { key: "name", header: "Nombre" },
            { key: "email", header: "Email" },
            { key: "role", header: "Rol" },
            { key: "status", header: "Estado" }
          ]}
          data={users.map((user) => ({ ...user, id: user.id }))}
        />
      </Card>
    </div>
  );
}
