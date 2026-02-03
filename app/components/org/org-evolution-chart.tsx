"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type EvolutionPoint = {
  day: string;
  oee: number;
  scrap: number;
};

export function OrgEvolutionChart({
  data,
}: {
  data: EvolutionPoint[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => v.slice(5)} // MM-DD
          />

          <YAxis
            yAxisId="left"
            domain={[0, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, "auto"]}
            tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
          />

<Tooltip
  formatter={(value) => {
    if (typeof value !== "number") return "";
    return `${(value * 100).toFixed(2)}%`;
  }}
/>


          <Line
            yAxisId="left"
            type="monotone"
            dataKey="oee"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="scrap"
            stroke="#f97316"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
