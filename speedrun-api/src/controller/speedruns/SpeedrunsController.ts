/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../data-source';
import Speedrun from '../../entities/speedruns/Speedrun';
import SpeedrunType from '../../entities/speedruns/SpeedrunType';
import User from '../../entities/user/User';
import UserSession from '../../entities/user/UserSession';
import Result, { Message } from '../../helper/Result';
import Route from '../../helper/Route';

export default class SpeedrunsController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedruns',
      controller: SpeedrunsController,
      action: 'all',
      auth: 'none',
    },
    {
      method: 'get',
      route: '/speedruns/:id',
      controller: SpeedrunsController,
      action: 'one',
      auth: 'none',
    },
    {
      method: 'post',
      route: '/speedruns',
      controller: SpeedrunsController,
      action: 'create',
      auth: 'session',
    },
    {
      method: 'put',
      route: '/speedruns/:id',
      controller: SpeedrunsController,
      action: 'update',
      auth: 'session',
    },
    {
      method: 'delete',
      route: '/speedruns/:id',
      controller: SpeedrunsController,
      action: 'remove',
      auth: 'session',
    },
  ];

  private speedrunRepository = AppDataSource.getRepository(Speedrun);

  private speedrunTypeRepository = AppDataSource.getRepository(SpeedrunType);

  private userRepository = AppDataSource.getRepository(User);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Speedrun[]>> {
    const { userId } = request.query;
    let where: FindOptionsWhere<Speedrun>[];
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
    const speedruns = await this.speedrunRepository.find({
      where,
      relations: ['type'],
    });
    return speedruns == null
      ? Result.fromError({
          message: 'Error getting speedruns',
          status: 404,
        })
      : Result.fromResult(speedruns);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Speedrun>> {
    const speedrun = await this.speedrunRepository.findOne({
      where: {
        id: Number(request.params.id),
      },
      relations: ['type'],
    });
    return speedrun == null
      ? Result.fromError({
          message: 'Speedrun not found',
          status: 404,
        })
      : Result.fromResult(speedrun);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Speedrun>> {
    if (session == null) {
      return Result.fromError({
        message: 'You are not logged in',
        status: 401,
      });
    }

    const { typeId, time } = request.body;
    const type = await this.speedrunTypeRepository.findOneBy({
      id: typeId,
    });

    if (type == null) {
      return Result.fromError({
        message: "The Speedrun type doesn't exist",
        status: 400,
      });
    }

    const speedrun = new Speedrun();
    speedrun.time = time;
    speedrun.type = type;
    speedrun.user = session.user;
    try {
      const result = await this.speedrunRepository.save(speedrun);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating speedrun',
        status: 400,
        innerError: e,
      });
    }
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Speedrun>> {
    if (session == null) {
      return Result.fromError({
        message: 'You are not logged in',
        status: 401,
      });
    }

    const { typeId, time } = request.body;

    const speedrun = await this.speedrunRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (speedrun == null) {
      return Result.fromError({
        message: 'Speedrun to update was not found',
        status: 404,
      });
    }

    let type: SpeedrunType;
    if (typeId !== null) {
      type = await this.speedrunTypeRepository.findOneBy({
        id: typeId,
      });
      if (type == null) {
        return Result.fromError({
          message: "The Speedrun type doesn't exist",
          status: 400,
        });
      }
    }

    if (session.user.id !== speedrun.user.id) {
      return Result.fromError({
        message: 'You are not allowed to update this Speedrun',
        status: 401,
      });
    }

    speedrun.time = time ?? speedrun.time;
    speedrun.type = type ?? speedrun.type;

    try {
      const result = await this.speedrunRepository.save(speedrun);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating speedrun',
        status: 400,
        innerError: e,
      });
    }
  }

  async remove(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Message>> {
    if (session == null) {
      return Result.fromError({
        message: 'You are not logged in',
        status: 401,
      });
    }

    const speedrunToRemove = await this.speedrunRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (speedrunToRemove == null) {
      return Result.fromError({
        message: 'Speedrun to delete was not found',
        status: 404,
      });
    }

    // admin role should be able to delete any speedrun
    if (session.user.id !== speedrunToRemove.user.id) {
      return Result.fromError({
        message: 'You are not allowed to delete this Speedrun',
        status: 401,
      });
    }

    try {
      await this.speedrunRepository.remove(speedrunToRemove);
      return Result.fromResult({
        message: 'Speedrun succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
