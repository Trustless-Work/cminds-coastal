import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser, Public, Roles, type AuthenticatedUser } from '../../auth';
import { UserRole } from '../../generated/prisma/enums';
import { StorageService } from '../storage/storage.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { ListFundingEscrowsQueryDto } from './dto/list-funding-escrows-query.dto';
import { ListParticipatingEscrowsQueryDto } from './dto/list-participating-escrows-query.dto';
import { UpdateEscrowMetadataDto } from './dto/update-escrow-metadata.dto';
import { UpdateEscrowStatusDto } from './dto/update-escrow-status.dto';
import { EscrowsService } from './escrows.service';

@ApiTags('escrows')
@ApiBearerAuth()
@Controller('escrows')
export class EscrowsController {
  constructor(
    @Inject(EscrowsService) private readonly escrowsService: EscrowsService,
    @Inject(StorageService) private readonly storageService: StorageService,
  ) {}

  @Public()
  @Get('funding')
  @ApiOperation({
    summary: 'List public/funding-ready escrows (no auth, cursor paginated)',
  })
  @ApiResponse({ status: 200, description: 'Paginated funding escrow list' })
  findFundingPublic(@Query() query: ListFundingEscrowsQueryDto) {
    return this.escrowsService.findFundingPublic(query);
  }

  @Public()
  @Get('funding/facets')
  @ApiOperation({
    summary: 'Filter facet options for the public funding catalog (no auth)',
  })
  @ApiResponse({ status: 200, description: 'Status and community facet lists' })
  findFundingPublicFacets() {
    return this.escrowsService.findFundingPublicFacets();
  }

  @Public()
  @Get('funding/:contractId')
  @ApiOperation({
    summary: 'Get public escrow metadata by contract ID (no auth)',
  })
  @ApiParam({
    name: 'contractId',
    description: 'Stellar contract ID (C-address)',
  })
  @ApiResponse({ status: 200, description: 'Escrow found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findFundingPublicByContract(@Param('contractId') contractId: string) {
    return this.escrowsService.findFundingPublicByContract(contractId);
  }

  @Post('upload-image')
  @Roles(UserRole.COMMUNITY_IMPLEMENTER)
  @ApiOperation({
    summary: 'Upload an escrow cover image to Supabase Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadEscrowImage(file);
  }

  @Post()
  @Roles(UserRole.COMMUNITY_IMPLEMENTER)
  @ApiOperation({
    summary: 'Persist off-chain escrow metadata after on-chain init',
  })
  @ApiResponse({ status: 201, description: 'Escrow created' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEscrowDto) {
    return this.escrowsService.create(user, dto);
  }

  @Get('mine')
  @Roles(UserRole.COMMUNITY_IMPLEMENTER)
  @ApiOperation({
    summary: 'List escrows initialized by the current user',
    deprecated: true,
    description: 'Prefer GET /escrows/participating?as=initializer',
  })
  @ApiResponse({ status: 200, description: 'Escrow list' })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.escrowsService.findMine(user);
  }

  @Get('participating')
  @Roles(
    UserRole.CMINDS_OPERATOR,
    UserRole.COMMUNITY_IMPLEMENTER,
    UserRole.RELEASE_SIGNER,
  )
  @ApiOperation({
    summary:
      'List escrows where the current user participates in the given role',
  })
  @ApiQuery({
    name: 'as',
    enum: ['initializer', 'approver', 'release_signer'],
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Escrow list' })
  findParticipating(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListParticipatingEscrowsQueryDto,
  ) {
    return this.escrowsService.findParticipating(user, query.as);
  }

  @Get(':escrowId')
  @ApiOperation({
    summary: 'Get escrow metadata by Stellar contract ID (escrow_id)',
  })
  @ApiParam({
    name: 'escrowId',
    description: 'Stellar contract ID (C-address)',
  })
  @ApiResponse({ status: 200, description: 'Escrow found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('escrowId') escrowId: string,
  ) {
    return this.escrowsService.findOne(user, escrowId);
  }

  @Patch(':escrowId')
  @Roles(UserRole.CMINDS_OPERATOR, UserRole.COMMUNITY_IMPLEMENTER)
  @ApiOperation({
    summary:
      'Update off-chain escrow title, description, and engagement after on-chain update',
  })
  @ApiParam({
    name: 'escrowId',
    description: 'Stellar contract ID (C-address)',
  })
  @ApiResponse({ status: 200, description: 'Escrow metadata updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  updateMetadata(
    @CurrentUser() user: AuthenticatedUser,
    @Param('escrowId') escrowId: string,
    @Body() dto: UpdateEscrowMetadataDto,
  ) {
    return this.escrowsService.updateMetadata(user, escrowId, dto);
  }

  @Patch(':escrowId/status')
  @Roles(UserRole.CMINDS_OPERATOR, UserRole.COMMUNITY_IMPLEMENTER)
  @ApiOperation({
    summary: 'Update off-chain escrow status (CANCELLED or COMPLETED)',
  })
  @ApiParam({
    name: 'escrowId',
    description: 'Stellar contract ID (C-address)',
  })
  @ApiResponse({ status: 200, description: 'Escrow status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('escrowId') escrowId: string,
    @Body() dto: UpdateEscrowStatusDto,
  ) {
    return this.escrowsService.updateStatus(user, escrowId, dto.status);
  }
}
