import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function Topbar({
  title,
  description,
  userName,
  roleLabel
}: Readonly<{
  title: string;
  description: string;
  userName: string;
  roleLabel: string;
}>) {
  return (
    <header className="mb-8 flex flex-col gap-5 isolate overflow-hidden rounded-[32px] border border-[#1f4d3a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,243,235,0.92))] px-7 py-6 shadow-[0_16px_50px_rgba(31,77,58,0.05)] lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#7a8d83]">PonchoCapital Wealth Portal</p>
        <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.04em] text-[#173126]">{title}</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#61746a]">{description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-[220px] rounded-[24px] border border-[#1f4d3a]/10 bg-white/75 px-4 py-3 text-right shadow-[0_10px_30px_rgba(31,77,58,0.04)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#7c8e85]">{roleLabel}</p>
          <p className="mt-2 text-[16px] font-medium text-[#173126]">{userName}</p>
          <p className="mt-1 text-[13px] text-[#6d7f75]">Acceso privado con informacion consolidada</p>
        </div>
        <form
          className="sm:flex sm:items-center"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button className="h-12 w-full px-5 sm:w-auto sm:min-w-[138px]" type="submit" variant="secondary">
            Cerrar sesion
          </Button>
        </form>
      </div>
    </header>
  );
}
