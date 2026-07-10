"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/revenue/read";

/** Smooth amber area chart with month labels along the x-axis. */
export function RevenueChart({
  data,
  gradientId,
}: {
  data: ChartPoint[];
  gradientId: string;
}) {
  return (
    <div className="h-[100px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5a623" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={10}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            padding={{ left: 4, right: 4 }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#f5a623"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
