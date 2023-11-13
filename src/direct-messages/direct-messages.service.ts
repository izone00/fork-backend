import { Injectable, NotFoundException } from '@nestjs/common';
import { DirectMessage } from './direct-messages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadReceipt } from './read-receipt.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DirectMessagesService {
  constructor(
    @InjectRepository(DirectMessage)
    private directMessageRepository: Repository<DirectMessage>,
    @InjectRepository(ReadReceipt)
    private readReceiptRepository: Repository<ReadReceipt>,
    private usersService: UsersService,
  ) {}

  findAllMessages(userId: number, otherUserId: number) {
    return this.directMessageRepository.find({
      where: [
        {
          sender: { id: userId },
          receiver: { id: otherUserId },
        },
        {
          sender: { id: otherUserId },
          receiver: { id: userId },
        },
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async createMassage(senderId: number, receiverId: number, content: string) {
    const readReceipt = await this.readReceiptRepository.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
      },
      relations: {
        sender: true,
        receiver: true,
      },
    });
    if (!readReceipt) {
      throw new NotFoundException('receipt가 있어야 dm을 만들수 있습니다.');
    }

    const message = this.directMessageRepository.create({
      sender: readReceipt.sender,
      receiver: readReceipt.receiver,
      content,
      readReceipt,
    });

    return this.directMessageRepository.save(message);
  }

  async createReadReceipt(senderId: number, receiverId: number) {
    const sender = await this.usersService.findById(senderId);
    const receiver = await this.usersService.findById(receiverId);
    if (!sender || !receiver) {
      throw new NotFoundException('잘못된 userId입니다.');
    }

    const readReceipt = this.readReceiptRepository.create({
      sender,
      receiver,
    });

    return this.readReceiptRepository.save(readReceipt);
  }

  async refreshReadReceipt(senderId: number, receiverId: number) {
    let readReceipt = await this.readReceiptRepository.findOneBy({
      sender: { id: senderId },
      receiver: { id: receiverId },
    });

    if (!readReceipt) {
      readReceipt = await this.createReadReceipt(senderId, receiverId);
    }

    return this.readReceiptRepository.save(readReceipt);
  }

  async getUnreadMsgCount(userId: number) {
    const unreadMsgCount = await this.directMessageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.readReceipt', 'receipt')
      .where('message.receiver.id = :userId', { userId })
      .andWhere('receipt.readAt < message.createdAt')
      .addSelect('COUNT(*) AS commentCount')
      .groupBy('receipt.id')
      .select(['receipt.id', 'COUNT(*) as count'])
      .getRawMany();

    return unreadMsgCount;
  }
}
