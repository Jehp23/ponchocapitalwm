import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Sidebar, clientNav } from "@/components/layout/sidebar";
import { canAccessClient } from "@/lib/permissions";

export default async function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user?.role || !canAccessClient(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-6 py-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar
          title="Wealth Portal"
          subtitle="Tu patrimonio consolidado, evolucion y contexto asesorado por PonchoCapital."
          items={clientNav}
        />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
