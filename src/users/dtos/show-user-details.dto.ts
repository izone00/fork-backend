import { AvatarEnum } from '../enums/avatar.enum';
import { Expose, Type } from 'class-transformer';
import { UserStatus } from '../enums/user-status.enum';
import { MatchHistoryDto } from './MatchHistory.dto';
export class ShowUserDetailsDto {
  @Expose()
  email: string;
  @Expose()
  nickname: string;
  @Expose()
  ladderPoint: number;
  @Expose()
  avatar: AvatarEnum;
  @Expose()
  bio: string;
  @Expose()
  @Type(() => MatchHistoryDto)
  matchHistorys: MatchHistoryDto[];
  @Expose()
  status: UserStatus;

  // 전적 정보 추가
}
