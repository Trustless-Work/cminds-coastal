import { Module } from '@nestjs/common';
import { AllowedEmailDomainsModule } from '../allowed-email-domains/allowed-email-domains.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AllowedEmailDomainsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
