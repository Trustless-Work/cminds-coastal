import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser, Public, Roles, type AuthenticatedUser } from '../../auth';
import { UserRole } from '../../generated/prisma/enums';
import { StorageService } from '../storage/storage.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
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
    summary: 'List public/funding-ready escrows (no auth)',
  })
  @ApiResponse({ status: 200, description: 'Funding escrow list' })
  findFundingPublic() {
    return this.escrowsService.findFundingPublic();
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
  @ApiOperation({ summary: 'List escrows initialized by the current user' })
  @ApiResponse({ status: 200, description: 'Escrow list' })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.escrowsService.findMine(user);
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
}
