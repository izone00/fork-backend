import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SecureShieldService } from 'src/secure-shield/secure-shield.service';
import { MatchHistory } from 'src/users/entities/match-history.entity';
import { Game } from 'src/games/games';
import { MatchResult } from 'src/users/enums/match-result.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private secureShieldService: SecureShieldService,
    @InjectRepository(MatchHistory)
    private matchHistoryRepository: Repository<MatchHistory>,
  ) {}

  findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  createUser(userEmail: string, createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.save({
      email: userEmail,
      ...createUserDto,
    });
  }

  findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findUserDetailById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        matchHistorys: true,
      },
    });
  }

  findByEmail(email: string): Promise<User> {
    const options: FindOneOptions<User> = { where: { email } };
    return this.userRepository.findOne(options);
  }

  updateUser(user: User, updateUserDto: UpdateUserDto) {
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async activate2fa(user: User): Promise<void> {
    if (user.is2fa) {
      throw new BadRequestException('2단계 인증이 이미 활성화 상태입니다.');
    }
    user.is2fa = true;
    await this.userRepository.save(user);
  }

  async deactivate2fa(user: User): Promise<void> {
    if (user.is2fa === false) {
      throw new BadRequestException('2단계 인증이 이미 비활성화 상태입니다.');
    }
    user.is2fa = false;
    user.otpSecret = null;
    await this.userRepository.save(user);
  }

  async createSecretKey(user: User): Promise<void> {
    user.otpSecret = this.secureShieldService.encrypt(this.secureShieldService.generateSecretKey());
    await this.userRepository.save(user);
  }

  async saveMatchHistory(game: Game): Promise<MatchHistory[]> {
    const user1 = await this.findById(game.player1.userId);
    const user2 = await this.findById(game.player2.userId);

    const resultByPlayer1 =
      game.player1.score > game.player2.score ? MatchResult.WIN : MatchResult.LOSS;
    const lpChangeByPlayer1 = Math.floor(Math.random() * 100);
    const historyByPlayer1 = this.matchHistoryRepository.create({
      user: user1,
      opponent: user2,
      result: resultByPlayer1,
      userScore: game.player1.score,
      opponentScore: game.player2.score,
      lpChange: resultByPlayer1 === MatchResult.WIN ? lpChangeByPlayer1 : -lpChangeByPlayer1,
    });

    const resultByPlayer2 =
      game.player2.score > game.player1.score ? MatchResult.WIN : MatchResult.LOSS;
    const lpChangeByPlayer2 = Math.floor(Math.random() * 100);
    const historyByPlayer2 = this.matchHistoryRepository.create({
      user: user2,
      opponent: user1,
      result: resultByPlayer2,
      userScore: game.player2.score,
      opponentScore: game.player1.score,
      lpChange: resultByPlayer2 === MatchResult.WIN ? lpChangeByPlayer2 : -lpChangeByPlayer2,
    });

    const historys = await this.matchHistoryRepository.save([historyByPlayer1, historyByPlayer2]);

    user1.ladderPoint += historyByPlayer1.lpChange;
    user2.ladderPoint += historyByPlayer2.lpChange;

    await this.userRepository.save([user1, user2]);

    return historys;
  }
}
