import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { roleHome } from "@/lib/permissions";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(roleHome[session.user.role]);
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top,_rgba(31,77,58,0.12),_transparent_28%),linear-gradient(180deg,_#fbf8f2,_#f6f2e8_50%,_#efe9dd)] px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
      <section className="hidden flex-col justify-between rounded-[36px] border border-[#1f4d3a]/10 bg-white/60 p-10 lg:flex">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[#1f4d3a]/10 bg-white/70">
              <Image alt="PonchoCapital" className="h-8 w-auto object-contain" height={32} priority src="/logo.png" width={32} />
            </div>
            <p className="text-xs uppercase tracking-[0.36em] text-[#1f4d3a]/75">PonchoCapital Wealth Portal</p>
          </div>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight text-[#173126]">
            Reporte privado de patrimonio con estetica de private banking.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#5f7368]">
            Una capa de visualizacion premium para clientes wealth de PonchoCapital. La operatoria real sigue ocurriendo por fuera del portal.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-[#1f4d3a]/6 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#6d7f75]">Patrimonio</p>
            <p className="mt-3 text-2xl font-semibold text-[#173126]">Centralizado</p>
          </div>
          <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-[#1f4d3a]/6 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#6d7f75]">Actualizacion</p>
            <p className="mt-3 text-2xl font-semibold text-[#173126]">Publicada</p>
          </div>
          <div className="rounded-[28px] border border-[#1f4d3a]/10 bg-[#1f4d3a]/6 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#6d7f75]">Trazabilidad</p>
            <p className="mt-3 text-2xl font-semibold text-[#173126]">Auditada</p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center">
        <LoginForm />
      </section>
    </main>
  );
}
