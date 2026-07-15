import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunitiesService } from './communities.service';

jest.mock('../../database', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../database';

describe('CommunitiesService', () => {
  let service: CommunitiesService;

  const prismaMock = {
    community: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(CommunitiesService);
  });

  it('lists active communities', async () => {
    prismaMock.community.findMany.mockResolvedValueOnce([]);
    await service.findActive();
    expect(prismaMock.community.findMany).toHaveBeenCalledWith({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
  });

  it('creates a community', async () => {
    const created = {
      community_id: 'c1',
      name: 'Alpha',
      description: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    prismaMock.community.create.mockResolvedValueOnce(created);
    await expect(
      service.create({ name: '  Alpha  ' }),
    ).resolves.toEqual(created);
  });

  it('soft-deletes a community', async () => {
    prismaMock.community.findUnique.mockResolvedValueOnce({
      community_id: 'c1',
      name: 'Alpha',
      description: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    prismaMock.community.update.mockResolvedValueOnce({
      community_id: 'c1',
      name: 'Alpha',
      description: null,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await service.softDelete('c1');
    expect(result.is_active).toBe(false);
    expect(prismaMock.community.update).toHaveBeenCalledWith({
      where: { community_id: 'c1' },
      data: { is_active: false },
    });
  });

  it('throws NotFound when updating missing community', async () => {
    prismaMock.community.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.update('missing', { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps unique constraint to ConflictException', async () => {
    prismaMock.community.create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(service.create({ name: 'Dup' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
