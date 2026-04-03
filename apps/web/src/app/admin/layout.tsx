import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Sidebar, adminNav } from "@/components/layout/sidebar";
import { canAccessAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-6 py-6 lg:px-8">
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar
          title="Admin Console"
          subtitle="Resumen rapido del portal y una operatoria separada para gestionar clientes y carteras."
          items={adminNav}
        />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
