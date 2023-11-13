import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RedisService } from 'src/commons/redis-client.service';
import { NotificationsService } from './notifications.service';
import { Server } from 'socket.io';
import { User } from 'src/users/user.entity';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  constructor(
    private redisService: RedisService,
    private notificationsService: NotificationsService,
  ) {}

  // prettier-ignore
  notiGameInvite(invitedUserId: number, invitingUser: User, gameType) {
    this.server
      .to(invitedUserId.toString())
      .emit('noti-game-invite', { 
        invitingUser,
        gameType
      });
  }

  // prettier-ignore
  notiChannelInvite(title: string, invitingUser: User, invitedUserId: number) {
    this.server
      .to(invitedUserId.toString())
      .emit('noti-channel-invite', {
        invitingUser,
        title,
      });
  }

  // prettier-ignore
  notiFriendRequest(requestedUserId: number, requestingUser: User) {
    this.server
      .to(requestedUserId.toString())
      .emit('noti-friend-requset', {
        requestingUser
      })
  }
}
