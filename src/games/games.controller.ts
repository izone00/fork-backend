import { BadRequestException, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/user.entity';
import { GamesGateway } from './games.gateway';

@UseGuards(AuthGuard)
@Controller('games')
export class GamesController {
  private watingUserId: number | null;

  constructor(private gamesGateway: GamesGateway) {}

  // 매칭 방식은 추후에 변경
  @Post('queue')
  async joinGameQueue(@GetUser() user: User) {
    if (!this.watingUserId) {
      this.watingUserId = user.id;
      return;
    }

    const userId1 = this.watingUserId;
    const userId2 = user.id;
    this.gamesGateway.initGame(userId1, userId2);

    this.watingUserId = null;
  }

  @Delete('queue')
  cancelGameQueue(@GetUser() user: User) {
    if (!(this.watingUserId === user.id)) {
      throw new BadRequestException('등록하지않은 큐를 취소할 수 없습니다.');
    }
    this.watingUserId = null;
  }

  @Post('invite/:user_id')
  inviteGame(@GetUser() user: User, @Param('user_id') invitedUserId: number) {
    const key = `game_invite:${user.id}-${invitedUserId}`;
    const value = invitedUserId;
    const duration = 3 * 60; // 3분
  }

  @Post('accept/:user_id')
  inviteGameAccept(@GetUser() user: User, @Param('user_id') invitingUserId: number) {
    const key = `game_invite:${invitingUserId}-${user.id}`;
    // find
    // if noting throw notFount

    // remove
    // strat game
  }

  @Delete('reject/:user_id')
  inviteGameReject(@GetUser() user: User, @Param('user_id') invitingUserId: number) {
    const key = `game_invite:${invitingUserId}-${user.id}`;
    // find
    // if noting throw notFount

    // remove
  }

  @Post('restart')
  restartGame() {}

  @Post('quit')
  quitGame() {
    // game end
  }
}
