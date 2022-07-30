/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import SpeedrunType from '../../entities/speedruns/SpeedrunType';
import { AppDataSource } from '../../data-source';
import Result from '../../helper/Result';
import Route from '../../helper/Route';
import SpeedrunGroup from '../../entities/speedruns/SpeedrunGroup';

export default class SpeedrunTypesController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedrun-types',
      controller: SpeedrunTypesController,
      action: 'all',
    },
    {
      method: 'get',
      route: '/speedrun-types/:id',
      controller: SpeedrunTypesController,
      action: 'one',
    },
    {
      method: 'post',
      route: '/speedrun-types',
      controller: SpeedrunTypesController,
      action: 'create',
    },
    {
      method: 'put',
      route: '/speedrun-types/:id',
      controller: SpeedrunTypesController,
      action: 'update',
    },
    {
      method: 'delete',
      route: '/speedrun-types/:id',
      controller: SpeedrunTypesController,
      action: 'remove',
    },
  ];

  private speedrunTypeRepository = AppDataSource.getRepository(SpeedrunType);

  private speedrunGroupRepository = AppDataSource.getRepository(SpeedrunGroup);

  async all(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunType[]>> {
    const types = await this.speedrunTypeRepository.find({
      relations: ['group'],
    });
    return types == null
      ? Result.fromError({
          message: 'Error getting Speedrun-Types',
          status: 404,
        })
      : Result.fromResult(types);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunType>> {
    const type = await this.speedrunTypeRepository.findOne({
      where: {
        id: Number(request.params.id),
      },
      relations: ['group'],
    });
    return type == null
      ? Result.fromError({
          message: 'Speedrun-Type not found',
          status: 404,
        })
      : Result.fromResult(type);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunType>> {
    const group = await this.speedrunGroupRepository.findOneBy({
      id: request.body.groupId,
    });

    if (group == null) {
      return Result.fromError({
        message: "The Speedrun-Group doesn't exist",
        status: 400,
      });
    }

    try {
      const type = new SpeedrunType();
      type.name = request.body.name;
      type.description = request.body.description;
      type.group = group;
      const result = await this.speedrunTypeRepository.save(type);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating Speedrun-Group',
        status: 400,
        innerError: e,
      });
    }
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunType>> {
    const type = await this.speedrunTypeRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (type == null) {
      return Result.fromError({
        message: 'Speedrun-Type to update not found',
        status: 404,
      });
    }

    const { categoryId: groupId } = request.body;
    let group: SpeedrunGroup;
    if (groupId !== null) {
      group = await this.speedrunGroupRepository.findOneBy({
        id: groupId,
      });
      type.group = group;
    }

    type.name = request.body.name ?? type.name;
    type.description = request.body.description ?? type.description;

    try {
      const result = await this.speedrunTypeRepository.save(type);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating Speedrun-Type',
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
    const typeToRemove = await this.speedrunTypeRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (typeToRemove == null) {
      return Result.fromError({
        message: 'Speedrun-Type to delete was not found',
        status: 404,
      });
    }
    try {
      await this.speedrunTypeRepository.remove(typeToRemove);
      return Result.fromResult({
        message: 'Speedrun-Type succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun-Type could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
