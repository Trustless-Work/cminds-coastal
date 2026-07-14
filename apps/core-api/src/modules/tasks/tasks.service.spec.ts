import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';

jest.mock('../../database', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../database';

describe('TasksService', () => {
  let service: TasksService;

  const prismaMock = {
    task: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  it('should list active tasks ordered by category and code', async () => {
    prismaMock.task.findMany.mockResolvedValue([]);
    await service.findActive();
    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });
  });
});
