import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from './notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { NotificationDto } from './dtos/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  createNoti(user: User, { type, title, content }: NotificationDto) {
    const noti = this.notificationRepository.create({
      user,
      type,
      title,
      content,
    });

    return this.notificationRepository.save(noti);
  }

  findAllNoti(userId: number) {
    return this.notificationRepository.find({
      where: {
        user: { id: userId },
        isRead: false,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  findOneById(notiId: number) {
    return this.notificationRepository.findOneBy({
      id: notiId,
    });
  }

  async readNoti(notiId: number) {
    const noti = await this.findOneById(notiId);
    if (!noti) {
      throw new NotFoundException('notification not found!');
    }

    noti.isRead = true;
    return this.notificationRepository.save(noti);
  }
}
