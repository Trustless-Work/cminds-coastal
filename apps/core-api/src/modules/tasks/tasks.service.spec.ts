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
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

  it('should list admin tasks paginated', async () => {
    const items = [
      {
        task_id: 't1',
        code: 'G-01',
        category: 'Management',
        name: 'Task',
        expected_deliverable: 'Doc',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    prismaMock.task.findMany.mockResolvedValueOnce(items);
    prismaMock.task.count.mockResolvedValueOnce(25);

    await expect(service.findAllAdmin({ page: 1, pageSize: 10 })).resolves.toEqual(
      {
        items,
        total: 25,
        page: 1,
        pageSize: 10,
        totalPages: 3,
      },
    );
    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      orderBy: [
        { is_active: 'desc' },
        { category: 'asc' },
        { code: 'asc' },
      ],
      skip: 0,
      take: 10,
    });
  });

  it('should soft-delete a task', async () => {
    prismaMock.task.findUnique.mockResolvedValueOnce({
      task_id: 't1',
      code: 'G-01',
      category: 'Management',
      name: 'Task',
      expected_deliverable: 'Doc',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    prismaMock.task.update.mockResolvedValueOnce({
      task_id: 't1',
      code: 'G-01',
      category: 'Management',
      name: 'Task',
      expected_deliverable: 'Doc',
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await service.softDelete('t1');
    expect(result.is_active).toBe(false);
  });
});
