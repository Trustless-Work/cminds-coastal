import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PollarAuthGuard } from './guards/pollar-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthIdentityService } from './services/auth-identity.service';
import { PollarTokenService } from './services/pollar-token.service';
import { SupabaseTokenService } from './services/supabase-token.service';

@Global()
@Module({
  providers: [
    PollarTokenService,
    SupabaseTokenService,
    AuthIdentityService,
    PollarAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useExisting: PollarAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
  ],
  exports: [PollarTokenService, SupabaseTokenService, AuthIdentityService],
})
export class AuthModule {}
