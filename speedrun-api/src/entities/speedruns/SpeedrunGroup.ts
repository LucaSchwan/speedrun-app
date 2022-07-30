import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import SpeedrunCategory from './SpeedrunCategory';

@Entity({ name: 'speedrun-group' })
export default class SpeedrunGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => SpeedrunCategory)
  @JoinColumn()
  category: SpeedrunCategory;
}
