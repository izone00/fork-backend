import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessagesGateway } from './direct-messages.gateway';

describe('DirectMessagesGateway', () => {
  let gateway: DirectMessagesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectMessagesGateway],
    }).compile();

    gateway = module.get<DirectMessagesGateway>(DirectMessagesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
