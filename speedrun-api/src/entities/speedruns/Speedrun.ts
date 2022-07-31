import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import User from '../User';
import SpeedrunType from './SpeedrunType';

@Entity({ name: 'speedrun' })
export default class Speedrun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => SpeedrunType)
  @JoinColumn()
  type: SpeedrunType;
}
