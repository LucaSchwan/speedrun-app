import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import SpeedrunGroup from './SpeedrunGroup';

@Entity({ name: 'speedrun-type' })
@Unique(['name', 'group'])
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
