import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth';
import { UserRole } from '../../generated/prisma/enums';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
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

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all tasks (admin)' })
  @ApiResponse({ status: 200, description: 'All tasks' })
  findAllAdmin() {
    return this.tasksService.findAllAdmin();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a task menu item' })
  @ApiResponse({ status: 201, description: 'Task created' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a task menu item' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft-delete a task menu item' })
  @ApiResponse({ status: 200, description: 'Task deactivated' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.softDelete(id);
  }
}
