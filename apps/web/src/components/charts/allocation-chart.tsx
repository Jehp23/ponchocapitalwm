"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1f4d3a", "#567b68", "#8ca798", "#d5c4a1", "#9b8f7a"];

export function AllocationChart({
  data
}: Readonly<{
  data: { name: string; value: number }[];
}>) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={108} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#fffaf1",
              border: "1px solid rgba(31,77,58,0.12)",
              borderRadius: "16px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
