/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import Speedrun from '../../entities/speedruns/Speedrun';
import { AppDataSource } from '../../data-source';
import Result from '../../helper/Result';
import Route from '../../helper/Route';
import SpeedrunType from '../../entities/speedruns/SpeedrunType';
import User from '../../entities/User';

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
    next: NextFunction
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
    next: NextFunction
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
    next: NextFunction
  ): Promise<Result<Speedrun>> {
    const type = await this.speedrunTypeRepository.findOneBy({
      id: request.body.groupId,
    });

    if (type == null) {
      return Result.fromError({
        message: "The Speedrun-Type doesn't exist",
        status: 400,
      });
    }

    const user = await this.userTypeRepository.findOneBy({
      id: request.body.userId,
    });

    if (user == null) {
      return Result.fromError({
        message: 'The User to update the Speedrun with was not found',
        status: 400,
      });
    }

    const speedrun = new Speedrun();
    speedrun.time = request.body.time;
    speedrun.type = type;
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
    next: NextFunction
  ): Promise<Result<Speedrun>> {
    const { userId, typeId, time } = request.body;

    const speedrun = await this.speedrunRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (speedrun == null) {
      return Result.fromError({
        message: 'Speedrun to update was not found',
        status: 404,
      });
    }

    speedrun.time = time ?? speedrun.time;

    let user: User;
    if (userId != null) {
      user = await this.userTypeRepository.findOneBy({
        id: userId,
      });
      if (user == null) {
        return Result.fromError({
          message: 'The User to update the Speedrun with was not found',
          status: 400,
        });
      }
      speedrun.user = user;
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
      speedrun.type = type;
    }

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
    next: NextFunction
  ): Promise<Result<any>> {
    const speedrunToRemove = await this.speedrunRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (speedrunToRemove == null) {
      return Result.fromError({
        message: 'Speedrun to delete was not found',
        status: 404,
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
