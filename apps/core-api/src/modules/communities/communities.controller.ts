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
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@ApiTags('communities')
@ApiBearerAuth()
@Controller('communities')
export class CommunitiesController {
  constructor(
    @Inject(CommunitiesService)
    private readonly communitiesService: CommunitiesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List active communities (picker)' })
  @ApiResponse({ status: 200, description: 'Active communities' })
  findActive() {
    return this.communitiesService.findActive();
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all communities (admin)' })
  @ApiResponse({ status: 200, description: 'All communities' })
  findAllAdmin() {
    return this.communitiesService.findAllAdmin();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a community' })
  @ApiResponse({ status: 201, description: 'Community created' })
  create(@Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a community' })
  @ApiResponse({ status: 200, description: 'Community updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communitiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft-delete a community' })
  @ApiResponse({ status: 200, description: 'Community deactivated' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.communitiesService.softDelete(id);
  }
}
