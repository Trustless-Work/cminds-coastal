import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser, Public, Roles, type AuthenticatedUser } from '../../auth';
import { UserRole } from '../../generated/prisma/enums';
import {
  RegisterEvidenceUrlDto,
  ResolveEvidenceQueryDto,
} from './dto/evidence.dto';
import { EvidenceService } from './evidence.service';

@ApiTags('evidence')
@Controller('evidence')
export class EvidenceController {
  constructor(
    @Inject(EvidenceService) private readonly evidenceService: EvidenceService,
  ) {}

  @Post('upload')
  @ApiBearerAuth()
  @Roles(UserRole.COMMUNITY_IMPLEMENTER)
  @ApiOperation({ summary: 'Upload evidence file; returns short on-chain id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        escrow_id: { type: 'string' },
        milestone_index: { type: 'integer' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Evidence file uploaded' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
    @Body('escrow_id') escrowId?: string,
    @Body('milestone_index') milestoneIndexRaw?: string,
  ) {
    const milestoneIndex =
      milestoneIndexRaw !== undefined && milestoneIndexRaw !== ''
        ? Number(milestoneIndexRaw)
        : undefined;
    return this.evidenceService.uploadFile(
      file,
      user,
      escrowId,
      Number.isFinite(milestoneIndex) ? milestoneIndex : undefined,
    );
  }

  @Post('register-url')
  @ApiBearerAuth()
  @Roles(UserRole.COMMUNITY_IMPLEMENTER)
  @ApiOperation({
    summary: 'Register an external evidence URL; returns short on-chain id',
  })
  @ApiResponse({ status: 201, description: 'URL registered' })
  registerUrl(
    @Body() dto: RegisterEvidenceUrlDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.evidenceService.registerUrl(dto, user);
  }

  @Public()
  @Get('resolve')
  @ApiOperation({ summary: 'Resolve short evidence ids to URLs/metadata' })
  @ApiQuery({ name: 'ids', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Resolved evidence refs' })
  resolve(@Query() query: ResolveEvidenceQueryDto) {
    return this.evidenceService.resolve(query.ids);
  }
}
