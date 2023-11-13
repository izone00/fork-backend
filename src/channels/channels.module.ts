import { Module } from '@nestjs/common';
import { ChannelsGateway } from './channels.gateway';
import { CommonsModule } from 'src/commons/commons.module';

@Module({
  imports: [CommonsModule],
  providers: [ChannelsGateway],
})
export class ChannelsModule {}
