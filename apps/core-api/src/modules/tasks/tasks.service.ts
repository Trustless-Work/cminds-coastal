import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';

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

type TaskUpdateData = {
  code?: string;
  category?: string;
  name?: string;
  expected_deliverable?: string;
  is_active?: boolean;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  );
}

@Injectable()
export class TasksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findActive(): Promise<TaskRecord[]> {
    return this.prisma.task.findMany({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });
  }

  async findAllAdmin(): Promise<TaskRecord[]> {
    return this.prisma.task.findMany({
      orderBy: [
        { is_active: 'desc' },
        { category: 'asc' },
        { code: 'asc' },
      ],
    });
  }

  async create(dto: CreateTaskDto): Promise<TaskRecord> {
    const code = dto.code.trim().toUpperCase();
    try {
      return await this.prisma.task.create({
        data: {
          code,
          category: dto.category.trim(),
          name: dto.name.trim(),
          expected_deliverable: dto.expected_deliverable.trim(),
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(`Task code "${code}" already exists`);
      }
      throw error;
    }
  }

  async update(taskId: string, dto: UpdateTaskDto): Promise<TaskRecord> {
    await this.requireTask(taskId);

    const data: TaskUpdateData = {};
    if (dto.code !== undefined) {
      data.code = dto.code.trim().toUpperCase();
    }
    if (dto.category !== undefined) {
      data.category = dto.category.trim();
    }
    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.expected_deliverable !== undefined) {
      data.expected_deliverable = dto.expected_deliverable.trim();
    }
    if (dto.is_active !== undefined) {
      data.is_active = dto.is_active;
    }

    try {
      return await this.prisma.task.update({
        where: { task_id: taskId },
        data,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Task code "${dto.code?.trim().toUpperCase()}" already exists`,
        );
      }
      throw error;
    }
  }

  async softDelete(taskId: string): Promise<TaskRecord> {
    await this.requireTask(taskId);
    return this.prisma.task.update({
      where: { task_id: taskId },
      data: { is_active: false },
    });
  }

  private async requireTask(taskId: string): Promise<TaskRecord> {
    const task = await this.prisma.task.findUnique({
      where: { task_id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    return task;
  }
}
