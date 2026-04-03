"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileSpreadsheet, ArrowLeftRight, FolderClock, UserCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function Sidebar({
  title,
  subtitle,
  items
}: Readonly<{
  title: string;
  subtitle: string;
  items: NavItem[];
}>) {
  const currentPath = usePathname();

  return (
    <aside className="glass-panel grid-sheen sticky top-0 self-start h-[calc(100vh-3rem)] isolate overflow-hidden rounded-[32px] border border-[#1f4d3a]/10 p-6 shadow-[0_20px_60px_rgba(31,77,58,0.06)]">
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1f4d3a]/10 bg-white/70">
              <Image alt="PonchoCapital" className="h-6 w-auto object-contain" height={24} priority src="/logo.png" width={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#1f4d3a]/75">PonchoCapital</p>
              <p className="text-xs text-[#6d7f75]">Wealth Portal</p>
            </div>
          </div>
          <h1 className="mt-5 text-[30px] font-semibold tracking-[-0.04em] text-[#173126]">{title}</h1>
          <p className="mt-2 max-w-xs text-[14px] leading-6 text-[#6d7f75]">{subtitle}</p>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const isRootSection = item.href === "/admin" || item.href === "/client";
            const isActive = isRootSection ? currentPath === item.href : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-[22px] px-4 py-3.5 text-sm transition",
                  isActive
                    ? "bg-[linear-gradient(180deg,rgba(31,77,58,0.11),rgba(31,77,58,0.07))] text-[#173126] shadow-[0_10px_30px_rgba(31,77,58,0.06)]"
                    : "text-[#5f7368] hover:bg-[#1f4d3a]/5 hover:text-[#173126]"
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-[26px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.08),rgba(31,77,58,0.03))] p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#1f4d3a]/75">Wealth Operations</p>
          <p className="mt-3 text-[14px] leading-6 text-[#476457]">
            El portal concentra visualizacion, mantenimiento interno y publicacion. La operatoria real sigue ocurriendo por fuera del sistema.
          </p>
        </div>
      </div>
    </aside>
  );
}

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/operations", label: "Operatoria", icon: ArrowLeftRight },
  { href: "/admin/clients", label: "Clientes", icon: Users },
  { href: "/admin/imports", label: "Importacion inicial", icon: FileSpreadsheet },
  { href: "/admin/audit", label: "Auditoria", icon: FolderClock }
];

export const clientNav: NavItem[] = [
  { href: "/client", label: "Resumen", icon: LayoutDashboard },
  { href: "/client/movements", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/client/profile", label: "Perfil", icon: UserCircle }
];
