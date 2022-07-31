/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    },
    {
      method: 'get',
      route: '/sessions/:id',
      controller: UserSessionController,
      action: 'one',
    },
  ];

  private UserSessionRepository = AppDataSource.getRepository(UserSesssion);

  async all(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<UserSesssion[]>> {
    const userSessions = await this.UserSessionRepository.find({
      relations: ['user'],
    });
    return userSessions == null
      ? Result.fromError({
          message: 'Error getting User-Sessions',
          status: 404,
        })
      : Result.fromResult(userSessions);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<UserSesssion>> {
    const userSessions = await this.UserSessionRepository.findOne({
      where: {
        id: Number(request.params.id),
      },
      relations: ['user'],
    });
    return userSessions == null
      ? Result.fromError({
          message: 'User-Session not found',
          status: 404,
        })
      : Result.fromResult(userSessions);
  }
}
