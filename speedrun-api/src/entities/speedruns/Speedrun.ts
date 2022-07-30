import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import SpeedrunType from './SpeedrunType';

@Entity({ name: 'speedrun' })
export default class Speedrun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time: number;

  @ManyToOne(() => SpeedrunType)
  @JoinColumn()
  type: SpeedrunType;
}
