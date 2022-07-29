import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'sample' })
export default class SampleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;
}
