"use client";

import type { PlannedUsdcByTaskCategoryRow } from "@repo/features/escrow/services/analytics.service";
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type PlannedUsdcByCategoryChartProps = {
  data: PlannedUsdcByTaskCategoryRow[];
};

const chartConfig = {
  amount: {
    label: "Planned USDC",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatUsdc(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const PlannedUsdcByCategoryChart = ({
  data,
}: PlannedUsdcByCategoryChartProps) => {
  if (data.length === 0) {
    return null;
  }

  const chartData = data.map((row) => ({
    category: row.category,
    shortCategory:
      row.category.length > 18
        ? `${row.category.slice(0, 16)}…`
        : row.category,
    amount: row.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planned USDC by task category</CardTitle>
        <CardDescription>
          Milestone amounts rolled up by menu category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="shortCategory"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={120}
            />
            <XAxis dataKey="amount" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">Planned USDC</span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatUsdc(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
