/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import UserSesssion from '../../entities/user/UserSession';
import { AppDataSource } from '../../data-source';
import Result from '../../helper/Result';
import Route from '../../helper/Route';

export default class UserSessionController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/sessions',
      controller: UserSessionController,
      action: 'all',
      auth: 'none',
    },
    {
      method: 'get',
      route: '/sessions/:id',
      controller: UserSessionController,
      action: 'one',
      auth: 'none',
    },
  ];

  private UserSessionRepository = AppDataSource.getRepository(UserSesssion);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSesssion
  ): Promise<Result<UserSesssion[]>> {
    // should be admin to get other users sessions
    const userSessions = await this.UserSessionRepository.find({
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
    session: UserSesssion
  ): Promise<Result<UserSesssion>> {
    // should be admin to get other users sessions
    const userSessions = await this.UserSessionRepository.findOne({
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
