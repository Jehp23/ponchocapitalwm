import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "glass-panel isolate overflow-hidden rounded-[32px] border border-[#1f4d3a]/10 shadow-[0_12px_40px_rgba(31,77,58,0.05),0_2px_8px_rgba(23,49,38,0.03)]",
        className
      )}
    >
      {children}
    </div>
  );
}
