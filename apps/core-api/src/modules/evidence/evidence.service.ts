import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';
import { PrismaService } from '../../database';
import { EvidenceRefKind } from '../../generated/prisma/enums';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import type { RegisterEvidenceUrlDto } from './dto/evidence.dto';

export type EvidenceRefResponse = {
  id: string;
  kind: 'file' | 'url';
  url: string;
  filename: string | null;
  mime_type: string | null;
  escrow_id: string | null;
  milestone_index: number | null;
  created_at: Date;
};

@Injectable()
export class EvidenceService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  private createShortId(): string {
    return randomBytes(8).toString('hex');
  }

  async uploadFile(
    file: Express.Multer.File,
    authUser: AuthenticatedUser,
    escrowId?: string,
    milestoneIndex?: number,
  ): Promise<EvidenceRefResponse> {
    const user = await this.usersService.requireSyncedUser(authUser);
    const uploaded = await this.storage.uploadEvidenceFile(file);
    const id = this.createShortId();

    const row = await this.prisma.evidenceRef.create({
      data: {
        id,
        kind: EvidenceRefKind.FILE,
        storage_path: uploaded.storage_path,
        public_url: uploaded.public_url,
        filename: uploaded.filename,
        mime_type: uploaded.mime_type,
        escrow_id: escrowId,
        milestone_index: milestoneIndex,
        created_by: user.user_id,
      },
    });

    return this.toResponse(row);
  }

  async registerUrl(
    dto: RegisterEvidenceUrlDto,
    authUser: AuthenticatedUser,
  ): Promise<EvidenceRefResponse> {
    const user = await this.usersService.requireSyncedUser(authUser);
    const trimmed = dto.url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      throw new BadRequestException('URL must start with http:// or https://');
    }

    const id = this.createShortId();
    const row = await this.prisma.evidenceRef.create({
      data: {
        id,
        kind: EvidenceRefKind.URL,
        external_url: trimmed,
        escrow_id: dto.escrow_id,
        milestone_index: dto.milestone_index,
        created_by: user.user_id,
      },
    });

    return this.toResponse(row);
  }

  async resolve(idsRaw: string): Promise<EvidenceRefResponse[]> {
    const ids = idsRaw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      throw new BadRequestException('At least one id is required');
    }
    if (ids.length > 20) {
      throw new BadRequestException('Too many ids (max 20)');
    }

    const rows = await this.prisma.evidenceRef.findMany({
      where: { id: { in: ids } },
    });

    const byId = new Map(rows.map((row) => [row.id, row]));

    return ids
      .map((id) => byId.get(id))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((row) => this.toResponse(row));
  }

  private toResponse(row: {
    id: string;
    kind: EvidenceRefKind;
    public_url: string | null;
    external_url: string | null;
    filename: string | null;
    mime_type: string | null;
    escrow_id: string | null;
    milestone_index: number | null;
    created_at: Date;
  }): EvidenceRefResponse {
    const url =
      row.kind === EvidenceRefKind.FILE
        ? (row.public_url ?? '')
        : (row.external_url ?? '');

    return {
      id: row.id,
      kind: row.kind === EvidenceRefKind.FILE ? 'file' : 'url',
      url,
      filename: row.filename,
      mime_type: row.mime_type,
      escrow_id: row.escrow_id,
      milestone_index: row.milestone_index,
      created_at: row.created_at,
    };
  }
}
