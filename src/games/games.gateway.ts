import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/users/user.entity';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { NotificationType } from 'src/notifications/enums/notification.enum';
import { SocketConnectionGateway } from 'src/socket-connection/socket-connection.gateway';
import { Game, GameStatus, Player } from './games';
import { UsersService } from 'src/users/users.service';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class GamesGateway {
  @WebSocketServer() server: Server;
  readonly games = new Map<string, Game>();
  readonly players = new Map<string, { player: Player; game: Game }>();

  constructor(
    private socketConnectionGateway: SocketConnectionGateway,
    private usersService: UsersService,
  ) {
    setInterval(() => {
      this.games.forEach((game, key) => {
        const socketId1 = game.player1.socketId;
        const socketId2 = game.player2.socketId;

        if (game.status === GameStatus.PROGRESS) {
          game.movePaddle();
          game.moveBall();

          this.server.to(socketId1).emit('game-info', {
            me: game.player1,
            oppense: game.player2,
            ball: game.ball,
          });

          const { playerReverse1, playerReverse2, ballReverse } = game.reverse();
          this.server.to(socketId2).emit('game-info', {
            me: playerReverse2,
            oppense: playerReverse1,
            ball: ballReverse,
          });
        } else if (game.status === GameStatus.FINISH) {
          this.usersService
            .saveMatchHistory(game)
            .then((matchHistorys) => {
              this.server.to(socketId1).emit('game-result', matchHistorys[0]);
              this.server.to(socketId2).emit('game-result', matchHistorys[1]);
            })
            .catch((e) => console.log(e));

          this.games.delete(key);
          this.players.delete(socketId1);
          this.players.delete(socketId2);
        }
      });
    }, 50);
  }

  handleDisconnect(clientSocket: Socket): void {
    const gamePlayer = this.players.get(clientSocket.id);

    if (gamePlayer) {
      const player = this.players.get(clientSocket.id).player;
      const game = this.players.get(clientSocket.id).game;
      game.status = GameStatus.FINISH;
      const { me, oppense } =
        player === game.player1
          ? { me: game.player1, oppense: game.player2 }
          : { me: game.player2, oppense: game.player1 };
      me.score = 0;
      oppense.score = 3;
    }
  }

  async initGame(userId1: number, userId2: number) {
    const socketId1 = (await this.socketConnectionGateway.userToSocket(userId1)).id;
    const socketId2 = (await this.socketConnectionGateway.userToSocket(userId2)).id;

    const game = new Game(socketId1, socketId2);
    game.player1.userId = userId1;
    game.player2.userId = userId2;
    const player1 = game.player1;
    const player2 = game.player2;

    this.games.set(game.player1.socketId, game); // key값 수정
    this.players.set(socketId1, { player: player1, game });
    this.players.set(socketId2, { player: player2, game });

    this.server.to(socketId1).emit('game-start', {
      me: game.player1,
      oppense: game.player2,
      ball: game.ball,
    });

    const { playerReverse1, playerReverse2, ballReverse } = game.reverse();
    // info: ShowUserOverviewDto 유저 정보 추가
    this.server.to(socketId2).emit('game-start', {
      me: playerReverse2,
      oppense: playerReverse1,
      ball: ballReverse,
    });

    // 3초 후 게임 시작
    setTimeout(() => (game.status = GameStatus.PROGRESS), 3000);
  }

  @SubscribeMessage('move-paddle')
  gamePaddleMove(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() event: { type: string; key: string },
  ) {
    const socketId = clientSocket.id;
    const player = this.players.get(socketId).player;
    if (event.type === 'keydown') {
      if (event.key === 'ArrowLeft') player.moveLeft();
      else if (event.key === 'ArrowRight') player.moveRight();
    } else if (event.type === 'keyup') {
      if (event.key === 'ArrowLeft') player.moveStop();
      else if (event.key === 'ArrowRight') player.moveStop();
    }
  }

  // pause

  // resume

  // giveup

  // prettier-ignore
  notiGameInvite(invitedUserId: number, invitingUser: User) {
    this.server
      .to(invitedUserId.toString())
      .emit('noti', { 
        type: NotificationType.GAME_INVITE,
        invitingUser
        // gameType
      });
  }
}
