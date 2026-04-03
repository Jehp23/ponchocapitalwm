import { auth } from "@/auth";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { getClientOverview } from "@/modules/dashboard/queries";

export default async function ClientProfilePage() {
  const session = await auth();
  const client = await getClientOverview(session?.user?.clientId ?? "");

  return (
    <div>
      <Topbar title="Perfil" description="Informacion basica del cliente y contexto del servicio." userName={session?.user?.name ?? ""} roleLabel="Cliente" />
      <section className="mb-6 rounded-[34px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,239,229,0.84))] px-7 py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c8e85]">Perfil del cliente</p>
        <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#173126]">Informacion esencial de la relacion wealth.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#61746a]">
          Un resumen simple de identidad, moneda de referencia y ultima informacion publicada en el portal.
        </p>
      </section>
      <Card className="p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/72 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Cliente</p>
            <p className="mt-3 text-[18px] font-medium text-[#173126]">{client?.displayName}</p>
          </div>
          <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/72 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Email</p>
            <p className="mt-3 text-[18px] font-medium text-[#173126]">{client?.email ?? "-"}</p>
          </div>
          <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/72 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Moneda base</p>
            <p className="mt-3 text-[18px] font-medium text-[#173126]">{client?.baseCurrency}</p>
          </div>
          <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-white/72 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c8e85]">Ultima publicacion</p>
            <p className="mt-3 text-[18px] font-medium text-[#173126]">{client?.lastPublishedAt?.toLocaleDateString("es-AR") ?? "-"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
