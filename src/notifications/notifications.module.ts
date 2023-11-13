import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { CommonsModule } from 'src/commons/commons.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), CommonsModule],
  providers: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
