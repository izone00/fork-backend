import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './direct-messages.entity';
import { ReadReceipt } from './read-receipt.entity';
import { DirectMessagesService } from './direct-messages.service';
import { UsersModule } from 'src/users/users.module';
import { DirectMessagesGateway } from './direct-messages.gateway';
import { CommonsModule } from 'src/commons/commons.module';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessage, ReadReceipt]), UsersModule, CommonsModule],
  providers: [DirectMessagesService, DirectMessagesGateway],
  exports: [DirectMessagesService],
})
export class DirectMessagesModule {}
