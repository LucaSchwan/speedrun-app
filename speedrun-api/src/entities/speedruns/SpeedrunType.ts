import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import SpeedrunGroup from './SpeedrunGroup';

@Entity({ name: 'speedrun-type' })
export default class SpeedrunType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => SpeedrunGroup)
  @JoinColumn()
  group: SpeedrunGroup;
}
