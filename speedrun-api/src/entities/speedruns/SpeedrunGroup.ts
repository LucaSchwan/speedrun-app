import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import SpeedrunCategory from './SpeedrunCategory';

@Entity({ name: 'speedrun-group' })
@Unique(['name', 'category'])
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
