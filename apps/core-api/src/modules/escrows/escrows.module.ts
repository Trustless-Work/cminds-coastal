import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { UsersModule } from '../users/users.module';
import { EscrowsController } from './escrows.controller';
import { EscrowsService } from './escrows.service';

@Module({
  imports: [UsersModule, StorageModule],
  controllers: [EscrowsController],
  providers: [EscrowsService],
  exports: [EscrowsService],
})
export class EscrowsModule {}
