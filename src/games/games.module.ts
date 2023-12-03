import { Module } from '@nestjs/common';
import { GamesGateway } from './games.gateway';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchHistory } from './match-history.entity';
import { UsersModule } from 'src/users/users.module';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchHistory]), SocketConnectionModule, UsersModule],
  controllers: [GamesController],
  providers: [GamesGateway, GamesService],
})
export class GamesModule {}
