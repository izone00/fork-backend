import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
@Unique(['sender', 'receiver'])
export class ReadReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => User)
  receiver: User;

  @UpdateDateColumn()
  readAt: Date;
}
