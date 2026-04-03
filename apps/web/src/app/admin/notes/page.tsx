// @ts-nocheck
import { format } from "date-fns";

import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { prisma } from "@/lib/prisma";
import { demoAdminOverview } from "@/lib/demo-data";
import { withDemoFallback } from "@/lib/demo-mode";

export default async function AdminNotesPage() {
  const session = await auth();
  const notes = await withDemoFallback(
    () =>
      prisma.advisorNote.findMany({
        include: {
          client: true,
          author: true
        },
        orderBy: { updatedAt: "desc" }
      }),
    () => demoAdminOverview.notes
  );

  return (
    <div>
      <Topbar title="Comentarios del asesor" description="Notas visibles para el cliente o mantenidas de forma interna antes de publicar." userName={session?.user?.name ?? ""} roleLabel={session?.user?.role ?? ""} />
      <section className="mb-6 rounded-[34px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,239,229,0.84))] px-7 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Advisor narrative</p>
        <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#173126]">Notas con el mismo nivel de cuidado que el resto de la experiencia.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
          Los comentarios del asesor completan la lectura financiera con contexto y criterio. Esta vista los ordena sin ruido ni artificio.
        </p>
      </section>
      <Card className="p-7">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">Notas registradas</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#173126]">Comentarios del asesor</h3>
        </div>
        <DataTable
          columns={[
            { key: "title", header: "Titulo" },
            { key: "client", header: "Cliente", render: (row) => row.client.displayName },
            { key: "visibility", header: "Visibilidad", render: (row) => row.visibility },
            { key: "author", header: "Autor", render: (row) => row.author.name },
            { key: "publishedAt", header: "Publicado", render: (row) => (row.publishedAt ? format(row.publishedAt, "dd/MM/yyyy") : "-") }
          ]}
          data={notes.map((note) => ({ ...note, id: note.id }))}
        />
      </Card>
    </div>
  );
}
