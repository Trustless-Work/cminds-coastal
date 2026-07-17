"use client";

import {
  buildMilestonePieSlices,
  MILESTONE_STATUS_COLORS,
  MILESTONE_STATUS_LABELS,
  type MilestonePieSlice,
  type MilestoneReviewStatus,
  type MilestoneStatusInput,
} from "@repo/helpers";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import { Label, Pie, PieChart } from "recharts";

type MilestoneStatusPieChartProps = {
  milestones: MilestoneStatusInput[];
  currency?: string;
};

function formatAmount(amount: number | null, currency: string): string {
  if (amount === null || !Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USDC" ? "USD" : currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const MilestoneStatusPieChart = ({
  milestones,
  currency = "USDC",
}: MilestoneStatusPieChartProps) => {
  const slices = buildMilestonePieSlices(milestones);

  if (slices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No milestones to display.</p>
    );
  }

  const chartData = slices.map((slice) => ({
    ...slice,
    value: 1,
    statusKey: slice.status,
    fill: `var(--color-${slice.status})`,
  }));

  const usedStatuses = Array.from(
    new Set(slices.map((slice) => slice.status)),
  ) as MilestoneReviewStatus[];

  const chartConfig: ChartConfig = {
    value: { label: "Milestones" },
    ...Object.fromEntries(
      usedStatuses.map((status) => [
        status,
        {
          label: MILESTONE_STATUS_LABELS[status],
          color: MILESTONE_STATUS_COLORS[status],
        },
      ]),
    ),
  };

  const total = slices.length;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Milestone progress</p>
        <p className="text-xs text-muted-foreground">
          Equal slices by task count — color shows status
        </p>
      </div>

      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[240px] w-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                nameKey="statusKey"
                formatter={(_value, _name, item) => {
                  const payload = item.payload as MilestonePieSlice & {
                    statusKey: MilestoneReviewStatus;
                  };
                  return (
                    <div className="flex w-full max-w-[220px] flex-col gap-0.5">
                      <span className="font-medium leading-snug">
                        {payload.title}
                      </span>
                      <span>
                        {MILESTONE_STATUS_LABELS[payload.statusKey]} ·{" "}
                        {formatAmount(payload.amount, currency)}
                      </span>
                      <span className="text-muted-foreground">
                        {payload.hasEvidence
                          ? "Evidence available"
                          : "No evidence yet"}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="statusKey"
            innerRadius={52}
            strokeWidth={3}
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
                        className="fill-foreground text-2xl font-semibold"
                      >
                        {total}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 18}
                        className="fill-muted-foreground text-xs"
                      >
                        Tasks
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="statusKey" />}
            className="-translate-y-1 flex-wrap gap-2 [&>*]:basis-auto"
          />
        </PieChart>
      </ChartContainer>

      <ul className="flex flex-wrap gap-x-3 gap-y-2" aria-label="Status legend">
        {usedStatuses.map((status) => (
          <li
            key={status}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: MILESTONE_STATUS_COLORS[status] }}
              aria-hidden
            />
            <span>{MILESTONE_STATUS_LABELS[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
