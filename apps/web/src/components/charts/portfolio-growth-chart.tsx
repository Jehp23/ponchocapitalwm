"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/utils";

export function PortfolioGrowthChart({
  data
}: Readonly<{
  data: { label: string; value: number }[];
}>) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#1f4d3a" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#1f4d3a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(31,77,58,0.1)" vertical={false} />
          <XAxis dataKey="label" stroke="#6d7f75" tickLine={false} axisLine={false} />
          <YAxis stroke="#6d7f75" tickFormatter={(value) => `$${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#fffaf1",
              border: "1px solid rgba(31,77,58,0.12)",
              borderRadius: "16px"
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Area dataKey="value" stroke="#1f4d3a" strokeWidth={2} fill="url(#growthFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
