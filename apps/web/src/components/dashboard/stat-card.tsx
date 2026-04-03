import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail
}: Readonly<{
  label: string;
  value: string;
  detail: string;
}>) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7c8e85]">{label}</p>
          <p className="mt-5 text-[34px] font-semibold tracking-[-0.03em] text-[#173126]">{value}</p>
          <p className="mt-3 max-w-[24ch] text-[14px] leading-6 text-[#60746a]">{detail}</p>
        </div>
        <div className="rounded-[20px] border border-[#1f4d3a]/10 bg-[linear-gradient(180deg,rgba(31,77,58,0.09),rgba(31,77,58,0.04))] p-3.5 text-[#1f4d3a]">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
