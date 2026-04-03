import { cn } from "@/lib/utils";

export function FormField({
  label,
  hint,
  children,
  className
}: Readonly<{
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <label className="block text-[11px] font-medium uppercase tracking-[0.22em] text-[#6f8177]">{label}</label>
        {hint ? <p className="text-[13px] leading-5 text-[#8a9a91]">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function FormPanel({
  title,
  subtitle,
  children
}: Readonly<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="rounded-[24px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(249,246,239,0.9))] p-5">
      <div className="mb-4 border-b border-[#1f4d3a]/8 pb-4">
        <h4 className="text-[15px] font-semibold text-[#173126]">{title}</h4>
        {subtitle ? <p className="mt-1 text-[13px] leading-5 text-[#7a8b82]">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
