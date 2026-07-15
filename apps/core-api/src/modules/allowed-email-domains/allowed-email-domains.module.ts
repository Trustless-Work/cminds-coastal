import { Module } from '@nestjs/common';
import { AllowedEmailDomainsController } from './allowed-email-domains.controller';
import { AllowedEmailDomainsService } from './allowed-email-domains.service';

@Module({
  controllers: [AllowedEmailDomainsController],
  providers: [AllowedEmailDomainsService],
  exports: [AllowedEmailDomainsService],
})
export class AllowedEmailDomainsModule {}
