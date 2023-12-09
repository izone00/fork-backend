import { Expose } from 'class-transformer';
import { ShowUserOverviewDto } from './show-user-overview.dto';
import { MatchResult } from '../enums/match-result.enum';

export class MatchHistoryDto {
  @Expose()
  id: number;

  @Expose()
  opponent: ShowUserOverviewDto;

  @Expose()
  result: MatchResult;

  @Expose()
  userScore: number;

  @Expose()
  opponentScore: number;

  @Expose()
  lpChange: number;

  // type:

  // speed

  @Expose()
  playedAt: Date;
}
