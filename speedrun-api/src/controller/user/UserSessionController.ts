/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../data-source';
import User from '../../entities/user/User';
import UserSession from '../../entities/user/UserSession';
import Result from '../../helper/Result';
import Route from '../../helper/Route';

export default class UserSessionController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/sessions',
      controller: UserSessionController,
      action: 'all',
      auth: 'admin',
    },
    {
      method: 'get',
      route: '/sessions/:id',
      controller: UserSessionController,
      action: 'one',
      auth: 'admin',
    },
  ];

  private userSessionRepository = AppDataSource.getRepository(UserSession);

  private userRepository = AppDataSource.getRepository(User);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<UserSession[]>> {
    const { userId } = request.query;
    let where: FindOptionsWhere<UserSession>[];
    if (userId) {
      const user = await this.userRepository.findOneBy({
        id: Number(userId),
      });
      if (user == null) {
        return Result.fromError({
          message: 'User not found',
          status: 404,
        });
      }
      where = [{ user }];
    }
    const userSessions = await this.userSessionRepository.find({
      relations: ['user'],
    });
    return userSessions == null
      ? Result.fromError({
          message: 'Error getting user sessions',
          status: 404,
        })
      : Result.fromResult(userSessions);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<UserSession>> {
    // should be admin to get other users sessions
    const userSessions = await this.userSessionRepository.findOne({
      where: {
        id: Number(request.params.id),
      },
      relations: ['user'],
    });
    return userSessions == null
      ? Result.fromError({
          message: 'User session not found',
          status: 404,
        })
      : Result.fromResult(userSessions);
  }
}
