import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { sessionMiddleware } from '@configs/session.config';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { RedisService } from './commons/redis-client.service';
import { WebsocketExceptionsFilter } from './filters/websocket-exception.fileter';
import { UsersService } from './users/users.service';
import { corsConfig } from '@configs/cors.config';

@WebSocketGateway({
  cors: corsConfig,
})
@UseFilters(new WebsocketExceptionsFilter())
export class MainGateway {
  @WebSocketServer() private server: Server;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private tmpUserService: UsersService,
  ) {}

  // socket서버가 열릴 때
  afterInit() {
    this.server.engine.use(sessionMiddleware(this.configService, this.redisService));
  }

  // client가 연결됬을 때
  async handleConnection(client: Socket) {
    const userEmail = client.request.session.email;
    const user = await this.tmpUserService.findByEmail(userEmail);
    const userId = user.id;
    console.log('client userId:', userId);

    // room이름을 나중에 sessionId에서 userId로 변경한다.
    client.join(userId.toString());
    await this.redisService.hset(client.id, 'socketId', userId);

    // 모든 채널에 조인시켜준다.
    // const channels = []; // 이후에 findAllChannel로 변경
    // channels.forEach((channel) => socket.join(channel.id));
  }

  // client와 연결이 해제 됬을 때
  handleDisconnect(client: Socket) {
    this.redisService.hdel(client.id, 'socketId');
  }
}
