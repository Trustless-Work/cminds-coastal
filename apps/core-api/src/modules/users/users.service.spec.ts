import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "../../generated/prisma/enums";
import type { AuthenticatedUser } from "../../auth/interfaces/authenticated-user";
import { UsersService } from "./users.service";

jest.mock("../../database", () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from "../../database";

describe("UsersService", () => {
  let service: UsersService;

  const authUser: AuthenticatedUser = {
    pollarUserId: "usr_test_1",
    email: "test@example.com",
    accessToken: "token",
  };

  const mockUser = {
    user_id: "11111111-1111-1111-1111-111111111111",
    pollar_user_id: "usr_test_1",
    email: "test@example.com",
    display_name: null,
    avatar_url: null,
    roles: [UserRole.COMMUNITY_IMPLEMENTER],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    wallets: [
      {
        wallet_id: "22222222-2222-2222-2222-222222222222",
        user_id: "11111111-1111-1111-1111-111111111111",
        pollar_wallet_id: "wal_1",
        address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (fn: (tx: typeof prismaMock) => Promise<unknown>) => fn(prismaMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe("sync", () => {
    it("creates a new user with the app role and primary wallet", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        ...mockUser,
        wallets: undefined,
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(null);
      prismaMock.wallet.updateMany.mockResolvedValueOnce({ count: 0 });
      prismaMock.wallet.create.mockResolvedValueOnce(mockUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(mockUser);

      const result = await service.sync(authUser, {
        email: "test@example.com",
        wallet_address:
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        pollar_wallet_id: "wal_1",
        role: UserRole.COMMUNITY_IMPLEMENTER,
      });

      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(prismaMock.wallet.create).toHaveBeenCalled();
      expect(result.roles).toContain(UserRole.COMMUNITY_IMPLEMENTER);
    });

    it("adds a missing role on an existing user without duplicating", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.COMMUNITY_IMPLEMENTER],
      });
      prismaMock.user.update.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.COMMUNITY_IMPLEMENTER, UserRole.FUNDER],
      });
      prismaMock.wallet.findUnique.mockResolvedValueOnce(mockUser.wallets[0]);
      prismaMock.wallet.update.mockResolvedValueOnce(mockUser.wallets[0]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.COMMUNITY_IMPLEMENTER, UserRole.FUNDER],
      });

      const result = await service.sync(authUser, {
        email: "test@example.com",
        wallet_address:
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        role: UserRole.FUNDER,
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            roles: [UserRole.COMMUNITY_IMPLEMENTER, UserRole.FUNDER],
          }),
        }),
      );
      expect(result.roles).toEqual([
        UserRole.COMMUNITY_IMPLEMENTER,
        UserRole.FUNDER,
      ]);
    });
  });

  describe("findMe", () => {
    it("returns the user profile when synced", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      await expect(service.findMe(authUser)).resolves.toEqual(mockUser);
    });

    it("throws NotFoundException when user was never synced", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.findMe(authUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it("throws UnauthorizedException when user is inactive", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        is_active: false,
      });
      await expect(service.findMe(authUser)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
