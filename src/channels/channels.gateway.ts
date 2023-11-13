import { corsConfig } from '@configs/cors.config';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/commons/redis-client.service';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class ChannelsGateway {
  @WebSocketServer() server: Server;

  constructor(private redisService: RedisService) {}

  // client가 연결됬을 때
  // async handleConnection(client: Socket) {
  // 모든 채널에 조인시켜준다.
  // const channels = []; // 이후에 findAllChannel로 변경
  // channels.forEach((channel) => socket.join(channel.id));
  // }

  // @SubscribeMessage('channel-message')
  // conmmunicateChannelMessage(client: Socket, dto: Dto) {
  //   // prettier-ignore
  //   this.server
  //     .to(dto.channelId.toString())
  //     .emit('channel-message', dto);
  // }

  // updateChannelMember(channelRelation: ChannelRelation) {
  //   const userId = channelRelation.userId;
  //   this.server.to(userId).emit(channelRelation);
  // }

  // kickChannelMember(userId: number, channelId: number) {
  //   // prettier-ignore
  //   this.server
  //     .to(userId.toString())
  //     .to(channelId.toString())
  //     .emit('channel-kick', {
  //       userId: userId,
  //       channelId: channelId,
  //     });
  // }
}
