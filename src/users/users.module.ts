import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { SecureShieldModule } from 'src/secure-shield/secure-shield.module';
import { MatchHistory } from 'src/users/entities/match-history.entity';
import { CommonsModule } from 'src/commons/commons.module';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MatchHistory]),
    SecureShieldModule,
    CommonsModule,
    SocketConnectionModule,
  ],
  exports: [TypeOrmModule, UsersService],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
