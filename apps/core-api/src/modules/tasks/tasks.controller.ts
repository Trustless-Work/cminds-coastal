import { Controller, Get, Inject } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List active fixed-menu conservation tasks' })
  @ApiResponse({ status: 200, description: 'Active tasks' })
  findActive() {
    return this.tasksService.findActive();
  }
}
