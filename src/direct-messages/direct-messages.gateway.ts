import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectMessageReceiveDto } from './dtos/direct-message-receive.dto';
import { RedisService } from 'src/commons/redis-client.service';
import { DirectMessagesService } from './direct-messages.service';
import { ParseIntPipe, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class DirectMessagesGateway {
  @WebSocketServer() server: Server;

  constructor(
    private redisService: RedisService,
    private directMessagesService: DirectMessagesService,
  ) {}

  @SubscribeMessage('DM')
  async communicateDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { receiverId, content }: DirectMessageReceiveDto,
  ) {
    const senderId = await this.redisService.hget(client.id, 'socketId'); // pipe
    const message = await this.directMessagesService.createMassage(senderId, receiverId, content);
    console.log(1, message);

    // prettier-ignore
    this.server
      .to(receiverId.toString())
      .emit('DM', {
        senderId,
        content
      });
  }

  @SubscribeMessage('DM-read-receipt')
  async refreshReadReceipt(
    @ConnectedSocket() client: Socket,
    @MessageBody('senderId', ParseIntPipe) senderId: number,
  ) {
    console.log('senderId: ', senderId);
    const receiverId = await this.redisService.hget(client.id, 'socketId'); // pipe
    const readReceipt = await this.directMessagesService.refreshReadReceipt(senderId, receiverId);

    console.log(readReceipt);
    return readReceipt;
  }

  @SubscribeMessage('DM-messages')
  async findAllDirectMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody('otherUserId', ParseIntPipe) otherUserId: number,
  ) {
    console.log('otherUserId: ', otherUserId);
    const userId = await this.redisService.hget(client.id, 'socketId'); // pipe
    const messages = await this.directMessagesService.findAllMessages(userId, otherUserId);

    console.log(messages);
    return messages;
  }

  @SubscribeMessage('DM-unread-count')
  async unReadMessageDirectCount(client: Socket) {
    const userId = await this.redisService.hget(client.id, 'socketId'); // pipe

    const unreadMassagesCount = await this.directMessagesService.getUnreadMsgCount(userId);

    console.log('unread: ', unreadMassagesCount);
    return unreadMassagesCount;
  }
}
