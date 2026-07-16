"use client";

import type { EscrowsByCommunityRow } from "@repo/features/escrow/services/analytics.service";
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

type EscrowsByCommunityChartProps = {
  data: EscrowsByCommunityRow[];
};

const chartConfig = {
  plannedUsdc: {
    label: "Planned USDC",
    color: "var(--chart-1)",
  },
  escrowCount: {
    label: "Escrows",
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

export const EscrowsByCommunityChart = ({
  data,
}: EscrowsByCommunityChartProps) => {
  if (data.length === 0) {
    return null;
  }

  const chartData = data.slice(0, 8).map((row) => ({
    name: row.name,
    shortName:
      row.name.length > 14 ? `${row.name.slice(0, 12)}…` : row.name,
    plannedUsdc: row.plannedUsdc,
    escrowCount: row.escrowCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escrows by community</CardTitle>
        <CardDescription>
          Planned USDC and escrow count per community
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
              dataKey="shortName"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={100}
            />
            <XAxis dataKey="plannedUsdc" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelKey="name"
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
            <Bar
              dataKey="plannedUsdc"
              fill="var(--color-plannedUsdc)"
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
