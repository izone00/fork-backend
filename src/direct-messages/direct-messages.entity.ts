import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { ReadReceipt } from './read-receipt.entity';

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => User)
  receiver: User;

  @Column()
  content: string;

  @ManyToOne(() => ReadReceipt, { nullable: false })
  readReceipt: ReadReceipt;

  @CreateDateColumn()
  createdAt: Date;
}
