import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'user-roles' })
export default class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  description: string;
}
