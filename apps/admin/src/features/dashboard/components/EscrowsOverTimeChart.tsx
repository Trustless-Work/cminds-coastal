"use client";

import type { EscrowsCreatedByMonthRow } from "@repo/features/escrow/services/analytics.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type EscrowsOverTimeChartProps = {
  data: EscrowsCreatedByMonthRow[];
};

const chartConfig = {
  count: {
    label: "Escrows",
    color: "var(--chart-1)",
  },
  plannedUsdc: {
    label: "Planned USDC",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

function formatMonthLabel(month: string): string {
  const [year, monthPart] = month.split("-");
  if (!year || !monthPart) {
    return month;
  }
  const date = new Date(Date.UTC(Number(year), Number(monthPart) - 1, 1));
  return date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
}

function formatUsdc(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const EscrowsOverTimeChart = ({ data }: EscrowsOverTimeChartProps) => {
  const hasData = data.some((row) => row.count > 0);
  if (!hasData) {
    return null;
  }

  const chartData = data.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escrows created over time</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {name === "plannedUsdc" ? "Planned USDC" : "Escrows"}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {name === "plannedUsdc"
                          ? formatUsdc(Number(value))
                          : String(value)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="count"
              type="natural"
              fill="var(--color-count)"
              fillOpacity={0.35}
              stroke="var(--color-count)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
