/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import Speedrun from '../../entities/speedruns/Speedrun';
import { AppDataSource } from '../../data-source';
import Result from '../../helper/Result';
import Route from '../../helper/Route';
import SpeedrunType from '../../entities/speedruns/SpeedrunType';
import User from '../../entities/user/User';
import UserSession from '../../entities/user/UserSession';

export default class SpeedrunsController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedruns',
      controller: SpeedrunsController,
      action: 'all',
    },
    {
      method: 'get',
      route: '/speedruns/:id',
      controller: SpeedrunsController,
      action: 'one',
    },
    {
      method: 'post',
      route: '/speedruns',
      controller: SpeedrunsController,
      action: 'create',
    },
    {
      method: 'put',
      route: '/speedruns/:id',
      controller: SpeedrunsController,
      action: 'update',
    },
    {
      method: 'delete',
      route: '/speedruns/:id',
      controller: SpeedrunsController,
      action: 'remove',
    },
  ];

  private speedrunRepository = AppDataSource.getRepository(Speedrun);

  private speedrunTypeRepository = AppDataSource.getRepository(SpeedrunType);

  private userTypeRepository = AppDataSource.getRepository(User);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Speedrun[]>> {
    const speedruns = await this.speedrunRepository.find({
      relations: ['type'],
    });
    return speedruns == null
      ? Result.fromError({
          message: 'Error getting Speedruns',
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
        message: "The Speedrun-Type doesn't exist",
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
        message: 'Error creating Speedrun',
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
          message: "The Speedrun-Type doesn't exist",
          status: 400,
        });
      }
    }

    // admin role should be able to update any speedrun
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
        message: 'Error updating Speedrun',
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
  ): Promise<Result<any>> {
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
