"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/revenue/read";
import { formatCompactMoney } from "@/lib/revenue/format";

/**
 * Smooth amber area chart matching the IndiePage cards. Shows two sparse y-axis
 * ticks (a low and a high reference) and month labels along the x-axis.
 */
export function RevenueChart({
  data,
  currency,
  gradientId,
}: {
  data: ChartPoint[];
  currency: string;
  gradientId: string;
}) {
  const amounts = data.map((d) => d.amount);
  const max = Math.max(...amounts, 1);
  // Two reference ticks like the screenshot: ~a quarter and the peak.
  const lowTick = Math.round((max / 4) * 100) / 100;
  const ticks = [lowTick, max];

  return (
    <div className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5a623" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#d9d9d9"
            strokeDasharray="4 4"
            vertical
            horizontal={false}
          />
          <YAxis
            width={48}
            axisLine={false}
            tickLine={false}
            ticks={ticks}
            domain={[0, max]}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(v: number) =>
              formatCompactMoney(v * 100, currency)
            }
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            padding={{ left: 4, right: 4 }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#f5a623"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
