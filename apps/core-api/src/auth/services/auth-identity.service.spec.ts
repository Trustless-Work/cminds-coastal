import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "../../generated/prisma/enums";
import type { AuthenticatedUser } from "../interfaces/authenticated-user";
import { AuthIdentityService } from "./auth-identity.service";

jest.mock("../../database", () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from "../../database";

describe("AuthIdentityService", () => {
  let service: AuthIdentityService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthIdentityService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AuthIdentityService);
  });

  it("finds admin by supabase_user_id", async () => {
    const authUser: AuthenticatedUser = {
      supabaseUserId: "sb-user-1",
      email: "admin@example.com",
      accessToken: "token",
      aal: "aal2",
    };

    prismaMock.user.findUnique.mockResolvedValueOnce({
      user_id: "u1",
      roles: [UserRole.ADMIN],
      is_active: true,
      supabase_user_id: "sb-user-1",
    });

    await expect(service.findUserByAuthIdentity(authUser)).resolves.toEqual({
      user_id: "u1",
      roles: [UserRole.ADMIN],
      is_active: true,
      supabase_user_id: "sb-user-1",
    });
  });

  it("links existing ADMIN row by email when supabase_user_id is null", async () => {
    const authUser: AuthenticatedUser = {
      supabaseUserId: "sb-user-1",
      email: "admin@example.com",
      accessToken: "token",
      aal: "aal2",
    };

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findFirst.mockResolvedValueOnce({
      user_id: "u1",
      roles: [UserRole.ADMIN],
      is_active: true,
      supabase_user_id: null,
    });
    prismaMock.user.update.mockResolvedValueOnce({
      user_id: "u1",
      roles: [UserRole.ADMIN],
      is_active: true,
      supabase_user_id: "sb-user-1",
    });

    await expect(service.findUserByAuthIdentity(authUser)).resolves.toEqual({
      user_id: "u1",
      roles: [UserRole.ADMIN],
      is_active: true,
      supabase_user_id: "sb-user-1",
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { user_id: "u1" },
      data: { supabase_user_id: "sb-user-1" },
      select: {
        user_id: true,
        roles: true,
        is_active: true,
        supabase_user_id: true,
      },
    });
  });

  it("does not create users when no ADMIN row matches", async () => {
    const authUser: AuthenticatedUser = {
      supabaseUserId: "sb-user-1",
      email: "nobody@example.com",
      accessToken: "token",
      aal: "aal2",
    };

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findFirst.mockResolvedValueOnce(null);

    await expect(service.findUserByAuthIdentity(authUser)).resolves.toBeNull();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});
