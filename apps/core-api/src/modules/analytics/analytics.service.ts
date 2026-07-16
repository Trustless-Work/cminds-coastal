import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { EscrowStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../database';

export type AdminAnalyticsKpis = {
  communitiesActive: number;
  communitiesInactive: number;
  tasksActive: number;
  tasksInactive: number;
  escrowsTotal: number;
  plannedUsdcTotal: number;
};

export type EscrowsByCommunityRow = {
  name: string;
  escrowCount: number;
  plannedUsdc: number;
};

export type TasksByCategoryRow = {
  category: string;
  count: number;
};

export type PlannedUsdcByTaskCategoryRow = {
  category: string;
  amount: number;
};

export type EscrowsByStatusRow = {
  status: EscrowStatus;
  count: number;
  plannedUsdc: number;
};

export type EscrowsCreatedByMonthRow = {
  month: string;
  count: number;
  plannedUsdc: number;
};

export type AdminAnalyticsOverview = {
  kpis: AdminAnalyticsKpis;
  escrowsByCommunity: EscrowsByCommunityRow[];
  tasksByCategory: TasksByCategoryRow[];
  plannedUsdcByTaskCategory: PlannedUsdcByTaskCategoryRow[];
  escrowsByStatus: EscrowsByStatusRow[];
  escrowsCreatedByMonth: EscrowsCreatedByMonthRow[];
};

function decimalToNumber(
  value: Prisma.Decimal | number | null | undefined,
): number {
  if (value == null) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  return value.toNumber();
}

function monthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function buildLastTwelveMonthKeys(now: Date = new Date()): string[] {
  const keys: string[] = [];
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - i, 1),
    );
    keys.push(monthKey(d));
  }
  return keys;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getAdminOverview(): Promise<AdminAnalyticsOverview> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setUTCMonth(twelveMonthsAgo.getUTCMonth() - 11);
    twelveMonthsAgo.setUTCDate(1);
    twelveMonthsAgo.setUTCHours(0, 0, 0, 0);

    const [
      communitiesActive,
      communitiesInactive,
      tasksActive,
      tasksInactive,
      escrowsTotal,
      plannedUsdcAgg,
      communitiesWithEscrows,
      tasksByCategoryGrouped,
      milestonesWithTask,
      allEscrows,
    ] = await Promise.all([
      this.prisma.community.count({ where: { is_active: true } }),
      this.prisma.community.count({ where: { is_active: false } }),
      this.prisma.task.count({ where: { is_active: true } }),
      this.prisma.task.count({ where: { is_active: false } }),
      this.prisma.escrow.count(),
      this.prisma.escrowMilestone.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.community.findMany({
        select: {
          name: true,
          escrows: {
            select: {
              milestones: {
                select: { amount: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.task.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { category: 'asc' },
      }),
      this.prisma.escrowMilestone.findMany({
        select: {
          amount: true,
          task: { select: { category: true } },
        },
      }),
      this.prisma.escrow.findMany({
        select: {
          status: true,
          created_at: true,
          milestones: { select: { amount: true } },
        },
      }),
    ]);

    const plannedUsdcTotal = decimalToNumber(plannedUsdcAgg._sum.amount);

    const escrowsByCommunity: EscrowsByCommunityRow[] = communitiesWithEscrows
      .map((community) => {
        const escrowCount = community.escrows.length;
        const plannedUsdc = community.escrows.reduce(
          (sum, escrow) =>
            sum +
            escrow.milestones.reduce(
              (mSum, m) => mSum + decimalToNumber(m.amount),
              0,
            ),
          0,
        );
        return {
          name: community.name,
          escrowCount,
          plannedUsdc,
        };
      })
      .filter((row) => row.escrowCount > 0)
      .sort(
        (a, b) =>
          b.plannedUsdc - a.plannedUsdc || b.escrowCount - a.escrowCount,
      );

    const tasksByCategory: TasksByCategoryRow[] = tasksByCategoryGrouped.map(
      (row) => ({
        category: row.category,
        count: row._count._all,
      }),
    );

    const plannedByCategoryMap = new Map<string, number>();
    for (const milestone of milestonesWithTask) {
      const category = milestone.task.category;
      const current = plannedByCategoryMap.get(category) ?? 0;
      plannedByCategoryMap.set(
        category,
        current + decimalToNumber(milestone.amount),
      );
    }
    const plannedUsdcByTaskCategory: PlannedUsdcByTaskCategoryRow[] = [
      ...plannedByCategoryMap.entries(),
    ]
      .map(([category, amount]) => ({ category, amount }))
      .sort(
        (a, b) => b.amount - a.amount || a.category.localeCompare(b.category),
      );

    const statusMap = new Map<
      EscrowStatus,
      { count: number; plannedUsdc: number }
    >();
    for (const escrow of allEscrows) {
      const amount = escrow.milestones.reduce(
        (sum, m) => sum + decimalToNumber(m.amount),
        0,
      );
      const current = statusMap.get(escrow.status) ?? {
        count: 0,
        plannedUsdc: 0,
      };
      statusMap.set(escrow.status, {
        count: current.count + 1,
        plannedUsdc: current.plannedUsdc + amount,
      });
    }
    const escrowsByStatus: EscrowsByStatusRow[] = [...statusMap.entries()]
      .map(([status, data]) => ({
        status,
        count: data.count,
        plannedUsdc: data.plannedUsdc,
      }))
      .sort((a, b) => b.count - a.count);

    const monthKeys = buildLastTwelveMonthKeys();
    const monthMap = new Map<string, { count: number; plannedUsdc: number }>();
    for (const key of monthKeys) {
      monthMap.set(key, { count: 0, plannedUsdc: 0 });
    }
    for (const escrow of allEscrows) {
      if (escrow.created_at < twelveMonthsAgo) {
        continue;
      }
      const key = monthKey(escrow.created_at);
      const bucket = monthMap.get(key);
      if (!bucket) {
        continue;
      }
      bucket.count += 1;
      bucket.plannedUsdc += escrow.milestones.reduce(
        (sum, m) => sum + decimalToNumber(m.amount),
        0,
      );
    }
    const escrowsCreatedByMonth: EscrowsCreatedByMonthRow[] = monthKeys.map(
      (month) => {
        const bucket = monthMap.get(month)!;
        return {
          month,
          count: bucket.count,
          plannedUsdc: bucket.plannedUsdc,
        };
      },
    );

    return {
      kpis: {
        communitiesActive,
        communitiesInactive,
        tasksActive,
        tasksInactive,
        escrowsTotal,
        plannedUsdcTotal,
      },
      escrowsByCommunity,
      tasksByCategory,
      plannedUsdcByTaskCategory,
      escrowsByStatus,
      escrowsCreatedByMonth,
    };
  }
}
