"use client";

import type { EscrowsByStatusRow } from "@repo/features/escrow/services/analytics.service";
import { formatEscrowStatusLabel } from "@repo/features/escrow/utils/escrow-status-display";
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
import { Label, Pie, PieChart } from "recharts";

type EscrowsByStatusChartProps = {
  data: EscrowsByStatusRow[];
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

function formatUsdc(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const EscrowsByStatusChart = ({ data }: EscrowsByStatusChartProps) => {
  if (data.length === 0) {
    return null;
  }

  const chartData = data.map((row, index) => {
    const key = row.status.toLowerCase();
    return {
      status: key,
      label: formatEscrowStatusLabel(row.status),
      count: row.count,
      plannedUsdc: row.plannedUsdc,
      fill: `var(--color-${key})`,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  });

  const chartConfig: ChartConfig = {
    count: { label: "Escrows" },
    ...Object.fromEntries(
      chartData.map((row) => [
        row.status,
        { label: row.label, color: row.color },
      ]),
    ),
  };

  const total = chartData.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Escrows by status</CardTitle>
        <CardDescription>Off-chain escrow lifecycle</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="status"
                  formatter={(value, _name, item) => {
                    const plannedUsdc =
                      typeof item.payload?.plannedUsdc === "number"
                        ? item.payload.plannedUsdc
                        : 0;
                    return (
                      <div className="flex w-full flex-col gap-0.5">
                        <span>
                          {String(value)} escrows · {formatUsdc(plannedUsdc)}{" "}
                          planned
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={4}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-semibold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-muted-foreground text-sm"
                        >
                          Escrows
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
