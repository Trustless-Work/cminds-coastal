import { formatCurrency } from "@repo/helpers";
import { useGetMultipleEscrowBalancesQuery } from "../../../../tanstack/useGetMultipleEscrowBalances";

type BalanceProgressDonutProps = {
  contractId: string;
  target: number;
  currency: string;
  /** Prefer this when the parent already has a synced / optimistic balance. */
  balance?: number;
};

export const BalanceProgressDonut = ({
  contractId,
  target,
  currency,
  balance,
}: BalanceProgressDonutProps) => {
  const isContractProvided = Boolean(
    contractId && contractId.trim().length > 0,
  );

  const { data, isLoading, isError } = useGetMultipleEscrowBalancesQuery({
    addresses: isContractProvided ? [contractId] : [],
    enabled: isContractProvided,
  });

  const currentBalanceRaw =
    balance !== undefined
      ? Number(balance)
      : Number(data?.[0]?.balance ?? 0);
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 0;
  const progressValue =
    safeTarget > 0
      ? Math.min(100, Math.max(0, (currentBalanceRaw / safeTarget) * 100))
      : 0;

  const size = 160;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = isLoading || isError ? 0 : progressValue;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          <span className="mr-1 font-bold">Balance:</span>
          {isLoading
            ? "Loading…"
            : isError
              ? "-"
              : formatCurrency(currentBalanceRaw, currency)}
        </p>
        <p>
          <span className="mr-1 font-bold">Target:</span>{" "}
          {formatCurrency(safeTarget, currency)}
        </p>
      </div>
      <div className="flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              stroke="currentColor"
              className="text-muted-foreground/20"
              fill="none"
              strokeLinecap="round"
            />
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={stroke}
                stroke="currentColor"
                className="text-primary"
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </g>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(pct)}%</span>
            <span className="text-sm text-muted-foreground">Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};
