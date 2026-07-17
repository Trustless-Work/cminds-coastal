import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { serverEnv } from '@repo/config';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  ...ALLOWED_IMAGE_MIME_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type UploadedEscrowImage = {
  image_url: string;
  storage_path: string;
};

export type UploadedEvidenceFile = {
  storage_path: string;
  public_url: string;
  filename: string;
  mime_type: string;
};

@Injectable()
export class StorageService {
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    const url = serverEnv.supabaseUrl;
    const key = serverEnv.supabaseServiceRoleKey;
    if (!url || !key) {
      const missing = [
        !url ? 'SUPABASE_URL' : null,
        !key ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
      ].filter(Boolean);
      throw new ServiceUnavailableException(
        `Supabase storage is not configured (missing: ${missing.join(', ')})`,
      );
    }
    if (!this.client) {
      this.client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return this.client;
  }

  async uploadEscrowImage(
    file: Express.Multer.File,
  ): Promise<UploadedEscrowImage> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Image must be jpeg, png, webp, or gif');
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('Image must be 5MB or smaller');
    }

    const extension = this.resolveExtension(file);
    const storagePath = `escrows/${randomUUID()}${extension}`;
    const bucket = serverEnv.supabaseEscrowImagesBucket;
    const client = this.getClient();

    const { error } = await client.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }

    const { data } = client.storage.from(bucket).getPublicUrl(storagePath);
    if (!data.publicUrl) {
      throw new BadRequestException('Failed to resolve public image URL');
    }

    return {
      image_url: data.publicUrl,
      storage_path: storagePath,
    };
  }

  async uploadEvidenceFile(
    file: Express.Multer.File,
  ): Promise<UploadedEvidenceFile> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Evidence file is required');
    }
    if (!ALLOWED_EVIDENCE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'File must be an image, PDF, Word document, or plain text',
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('File must be 5MB or smaller');
    }

    const extension = this.resolveEvidenceExtension(file);
    const objectId = randomBytes(8).toString('hex');
    const storagePath = `evidence/${objectId}${extension}`;
    const bucket = serverEnv.supabaseEvidenceBucket;
    const client = this.getClient();

    const { error } = await client.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(
        `Failed to upload evidence: ${error.message}`,
      );
    }

    const { data } = client.storage.from(bucket).getPublicUrl(storagePath);
    if (!data.publicUrl) {
      throw new BadRequestException('Failed to resolve public evidence URL');
    }

    return {
      storage_path: storagePath,
      public_url: data.publicUrl,
      filename: file.originalname || `evidence${extension}`,
      mime_type: file.mimetype,
    };
  }

  private resolveExtension(file: Express.Multer.File): string {
    const fromName = extname(file.originalname || '').toLowerCase();
    if (fromName && fromName.length <= 5) {
      return fromName;
    }
    switch (file.mimetype) {
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      default:
        return '.jpg';
    }
  }

  private resolveEvidenceExtension(file: Express.Multer.File): string {
    const fromName = extname(file.originalname || '').toLowerCase();
    if (fromName && fromName.length <= 8) {
      return fromName;
    }
    switch (file.mimetype) {
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      case 'application/pdf':
        return '.pdf';
      case 'application/msword':
        return '.doc';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      case 'text/plain':
        return '.txt';
      default:
        return '.bin';
    }
  }
}
