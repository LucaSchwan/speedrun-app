import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'speedrun-category' })
export default class SpeedrunCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;
}
