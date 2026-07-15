import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type AuthenticatedUser } from '../../auth';
import { UserRole } from '../../generated/prisma/enums';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { SyncUserDto } from './dto/sync-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upsert the authenticated Pollar user into the local database',
  })
  @ApiResponse({ status: 200, description: 'User synced' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  sync(@CurrentUser() user: AuthenticatedUser, @Body() dto: SyncUserDto) {
    return this.usersService.sync(user, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not synced yet' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findMe(user);
  }

  @Get('admin/me')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Return the authenticated admin profile (requires ADMIN role + AAL2)',
  })
  @ApiResponse({ status: 200, description: 'Current admin user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — missing ADMIN or AAL2' })
  @ApiResponse({ status: 404, description: 'Admin user not provisioned' })
  adminMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findMe(user);
  }

  @Get('search')
  @ApiOperation({
    summary:
      'Search users by email; optionally filter by role (escrow role pickers)',
  })
  @ApiResponse({ status: 200, description: 'Matching users with wallets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Role not searchable' })
  search(@Query() query: SearchUsersQueryDto) {
    return this.usersService.searchByRoleAndEmail({
      role: query.role,
      q: query.q,
    });
  }
}
