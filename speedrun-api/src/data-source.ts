/* eslint-disable import/prefer-default-export */
import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'speedrun',
  password: 'speedrun',
  database: 'speedrun',
  synchronize: true,
  logging: false,
  entities: ['src/entities/*.ts'],
  migrations: [],
  subscribers: [],
});
