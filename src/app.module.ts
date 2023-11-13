import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelationModule } from './user-relation/user-relation.module';
import { UsersModule } from './users/users.module';
import { TypeORMConfigProvider } from '@configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { TestService } from './test.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { MainGateway } from './main.gateway';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { CommonsModule } from './commons/commons.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeORMConfigProvider,
    }),
    UserRelationModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NotificationsModule,
    DirectMessagesModule,
    CommonsModule,
    ChannelsModule,
  ],
  providers: [TestService, MainGateway],
})
export class AppModule {}
