import { IsEnum, IsString } from 'class-validator';
import { NotificationType } from '../enums/notification.enum';

export class NotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  content: string;
}
