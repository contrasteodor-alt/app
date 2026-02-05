"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type AreaTrendPoint = {
  day: string;
  oee: number;
  scrap: number;
};

export function AreaTrendChart({
  data,
}: {
  data: AreaTrendPoint[];
}) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            tickFormatter={(d) => d.slice(5)} // MM-DD
          />

          <YAxis
            yAxisId="oee"
            domain={[0.4, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
          />

          <YAxis
            yAxisId="scrap"
            orientation="right"
            domain={[0, "auto"]}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
          />

          <Tooltip
            formatter={(value, name) => {
              if (typeof value !== "number") return ["", ""];

              if (name === "oee") {
                return [`${(value * 100).toFixed(1)}%`, "OEE"];
              }

              return [`${value.toFixed(2)}%`, "Scrap"];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />

          <Line
            yAxisId="oee"
            type="monotone"
            dataKey="oee"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
          />

          <Line
            yAxisId="scrap"
            type="monotone"
            dataKey="scrap"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
