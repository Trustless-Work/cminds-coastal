import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PollarAuthGuard } from "./guards/pollar-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { PollarTokenService } from "./services/pollar-token.service";

@Global()
@Module({
  providers: [
    PollarTokenService,
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
  exports: [PollarTokenService],
})
export class AuthModule {}
