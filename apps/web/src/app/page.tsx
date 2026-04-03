import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { roleHome } from "@/lib/permissions";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/login");
  }

  redirect(roleHome[session.user.role]);
}
