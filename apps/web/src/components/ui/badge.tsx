import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default"
}: Readonly<{
  children: React.ReactNode;
  tone?: "default" | "success" | "warning";
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "default" && "bg-[#1f4d3a]/8 text-[#1f4d3a]",
        tone === "success" && "bg-emerald-500/10 text-emerald-800",
        tone === "warning" && "bg-amber-500/12 text-amber-800"
      )}
    >
      {children}
    </span>
  );
}
