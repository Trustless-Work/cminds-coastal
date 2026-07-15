import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';

export type TaskRecord = {
  task_id: string;
  code: string;
  category: string;
  name: string;
  expected_deliverable: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class TasksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findActive(): Promise<TaskRecord[]> {
    return this.prisma.task.findMany({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });
  }
}
