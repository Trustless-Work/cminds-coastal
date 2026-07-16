import { Test, TestingModule } from '@nestjs/testing';
import { EscrowStatus } from '../../generated/prisma/enums';
import { AnalyticsService } from './analytics.service';

jest.mock('../../database', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../database';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const prismaMock = {
    community: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    escrow: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    escrowMilestone: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('should aggregate admin overview metrics', async () => {
    prismaMock.community.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);
    prismaMock.task.count.mockResolvedValueOnce(20).mockResolvedValueOnce(2);
    prismaMock.escrow.count.mockResolvedValueOnce(5);
    prismaMock.escrowMilestone.aggregate.mockResolvedValueOnce({
      _sum: { amount: { toNumber: () => 1500 } },
    });
    prismaMock.community.findMany.mockResolvedValueOnce([
      {
        name: 'Coastal A',
        escrows: [
          {
            milestones: [
              { amount: { toNumber: () => 100 } },
              { amount: { toNumber: () => 200 } },
            ],
          },
        ],
      },
      {
        name: 'Empty Community',
        escrows: [],
      },
    ]);
    prismaMock.task.groupBy.mockResolvedValueOnce([
      { category: 'Management & Coordination', _count: { _all: 4 } },
      { category: 'Custom', _count: { _all: 1 } },
    ]);
    prismaMock.escrowMilestone.findMany.mockResolvedValueOnce([
      {
        amount: { toNumber: () => 300 },
        task: { category: 'Management & Coordination' },
      },
      {
        amount: { toNumber: () => 100 },
        task: { category: 'Custom' },
      },
    ]);
    prismaMock.escrow.findMany.mockResolvedValueOnce([
      {
        status: EscrowStatus.INITIALIZED,
        created_at: new Date('2026-01-15T00:00:00.000Z'),
        milestones: [{ amount: { toNumber: () => 400 } }],
      },
      {
        status: EscrowStatus.INITIALIZED,
        created_at: new Date('2025-06-01T00:00:00.000Z'),
        milestones: [{ amount: { toNumber: () => 0 } }],
      },
      {
        status: EscrowStatus.INITIALIZED,
        created_at: new Date('2025-07-01T00:00:00.000Z'),
        milestones: [{ amount: { toNumber: () => 0 } }],
      },
      {
        status: EscrowStatus.COMPLETED,
        created_at: new Date('2025-08-01T00:00:00.000Z'),
        milestones: [{ amount: { toNumber: () => 600 } }],
      },
      {
        status: EscrowStatus.COMPLETED,
        created_at: new Date('2025-09-01T00:00:00.000Z'),
        milestones: [{ amount: { toNumber: () => 500 } }],
      },
    ]);

    const result = await service.getAdminOverview();

    expect(result.kpis).toEqual({
      communitiesActive: 3,
      communitiesInactive: 1,
      tasksActive: 20,
      tasksInactive: 2,
      escrowsTotal: 5,
      plannedUsdcTotal: 1500,
    });
    expect(result.escrowsByCommunity).toEqual([
      { name: 'Coastal A', escrowCount: 1, plannedUsdc: 300 },
    ]);
    expect(result.tasksByCategory).toEqual([
      { category: 'Management & Coordination', count: 4 },
      { category: 'Custom', count: 1 },
    ]);
    expect(result.plannedUsdcByTaskCategory).toEqual([
      { category: 'Management & Coordination', amount: 300 },
      { category: 'Custom', amount: 100 },
    ]);
    expect(result.escrowsByStatus).toEqual([
      {
        status: EscrowStatus.INITIALIZED,
        count: 3,
        plannedUsdc: 400,
      },
      {
        status: EscrowStatus.COMPLETED,
        count: 2,
        plannedUsdc: 1100,
      },
    ]);
    expect(result.escrowsCreatedByMonth).toHaveLength(12);
    const january = result.escrowsCreatedByMonth.find(
      (row) => row.month === '2026-01',
    );
    expect(january).toEqual({
      month: '2026-01',
      count: 1,
      plannedUsdc: 400,
    });
  });
});
