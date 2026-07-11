import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser, type AuthenticatedUser } from "../../auth";
import { SyncUserDto } from "./dto/sync-user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("sync")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Upsert the authenticated Pollar user into the local database",
  })
  @ApiResponse({ status: 200, description: "User synced" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  sync(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SyncUserDto,
  ) {
    return this.usersService.sync(user, dto);
  }

  @Get("me")
  @ApiOperation({ summary: "Return the authenticated user profile" })
  @ApiResponse({ status: 200, description: "Current user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not synced yet" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findMe(user);
  }
}
