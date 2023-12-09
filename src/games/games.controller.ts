import {
  BadRequestException,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/user.entity';
import { GamesGateway } from './games.gateway';
import { RedisService } from 'src/commons/redis-client.service';

@UseGuards(AuthGuard)
@Controller('games')
export class GamesController {
  private watingUserId: number | null = null;

  constructor(
    private gamesGateway: GamesGateway,
    private redisService: RedisService,
  ) {}

  // 매칭 방식은 추후에 queue를 이용하는것으로 변경
  @Post('queue')
  async joinGameQueue(@GetUser() user: User) {
    if (!this.watingUserId || this.watingUserId === user.id) {
      this.watingUserId = user.id;
      return;
    }

    const userId1 = this.watingUserId;
    const userId2 = user.id;
    this.watingUserId = null;

    return this.gamesGateway.initGame(userId1, userId2);
  }

  @Delete('queue')
  cancelGameQueue(@GetUser() user: User) {
    if (!(this.watingUserId === user.id)) {
      throw new BadRequestException('등록하지않은 큐를 취소할 수 없습니다.');
    }
    this.watingUserId = null;
  }

  @Post('invite/:user_id')
  async inviteGame(@GetUser() user: User, @Param('user_id') invitedUserId: number) {
    const key = `game_invite:${user.id}-${invitedUserId}`;
    const value = invitedUserId;
    const duration = 3 * 60; // 3분

    await this.redisService.setex(key, duration, value);
    this.gamesGateway.notiGameInvite(invitedUserId, user);
  }

  @Post('accept/:user_id')
  async inviteGameAccept(@GetUser() user: User, @Param('user_id') invitingUserId: number) {
    const key = `game_invite:${invitingUserId}-${user.id}`;

    const invitedUserId = await this.redisService.getdel(key);
    if (!invitedUserId) {
      throw new NotFoundException('없거나 만료된 초대입니다.');
    }

    return this.gamesGateway.initGame(invitingUserId, parseInt(invitedUserId));
  }

  @Delete('reject/:user_id')
  inviteGameReject(@GetUser() user: User, @Param('user_id') invitingUserId: number) {
    const key = `game_invite:${invitingUserId}-${user.id}`;

    return this.redisService.getdel(key);
  }
}
