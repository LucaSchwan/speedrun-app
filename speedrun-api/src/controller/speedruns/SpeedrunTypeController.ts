/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../data-source';
import SpeedrunGroup from '../../entities/speedruns/SpeedrunGroup';
import SpeedrunType from '../../entities/speedruns/SpeedrunType';
import UserSession from '../../entities/user/UserSession';
import Result, { Message } from '../../helper/Result';
import Route from '../../helper/Route';

export default class SpeedrunTypesController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedrun-types',
      controller: SpeedrunTypesController,
      action: 'all',
      auth: 'none',
    },
    {
      method: 'get',
      route: '/speedrun-types/:id',
      controller: SpeedrunTypesController,
      action: 'one',
      auth: 'none',
    },
    {
      method: 'post',
      route: '/speedrun-types',
      controller: SpeedrunTypesController,
      action: 'create',
      auth: 'session',
    },
    {
      method: 'put',
      route: '/speedrun-types/:id',
      controller: SpeedrunTypesController,
      action: 'update',
      auth: 'session',
    },
    {
      method: 'delete',
      route: '/speedrun-types/:id',
      controller: SpeedrunTypesController,
      action: 'remove',
      auth: 'session',
    },
  ];

  private speedrunTypeRepository = AppDataSource.getRepository(SpeedrunType);

  private speedrunGroupRepository = AppDataSource.getRepository(SpeedrunGroup);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunType[]>> {
    const { name, description } = request.query;
    let where: FindOptionsWhere<SpeedrunType>[];
    if (name) where = [{ name: name as string }];
    if (description) where.push({ description: description as string });
    const types = await this.speedrunTypeRepository.find({
      where,
      relations: ['group'],
    });
    return types == null
      ? Result.fromError({
          message: 'Error getting speedrun types',
          status: 404,
        })
      : Result.fromResult(types);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunType>> {
    const type = await this.speedrunTypeRepository.findOne({
      where: {
        id: Number(request.params.id),
      },
      relations: ['group'],
    });
    return type == null
      ? Result.fromError({
          message: 'Speedrun type not found',
          status: 404,
        })
      : Result.fromResult(type);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunType>> {
    const { groupId, name, description } = request.body;
    const group = await this.speedrunGroupRepository.findOneBy({
      id: groupId,
    });

    if (group == null) {
      return Result.fromError({
        message: "The Speedrun group doesn't exist",
        status: 400,
      });
    }

    const type = new SpeedrunType();
    type.name = name;
    type.description = description;
    type.group = group;

    try {
      const result = await this.speedrunTypeRepository.save(type);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating speedrun group',
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
  ): Promise<Result<SpeedrunType>> {
    const { name, description, groupId } = request.body;
    const type = await this.speedrunTypeRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (type == null) {
      return Result.fromError({
        message: 'Speedrun type to update not found',
        status: 404,
      });
    }

    let group: SpeedrunGroup;
    if (groupId !== null) {
      group = await this.speedrunGroupRepository.findOneBy({
        id: groupId,
      });
    }

    type.name = request.body.name ?? type.name;
    type.description = request.body.description ?? type.description;
    type.group = group;

    try {
      const result = await this.speedrunTypeRepository.save(type);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating speedrung type',
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
    const typeToRemove = await this.speedrunTypeRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (typeToRemove == null) {
      return Result.fromError({
        message: 'Speedrun type to delete was not found',
        status: 404,
      });
    }
    try {
      await this.speedrunTypeRepository.remove(typeToRemove);
      return Result.fromResult({
        message: 'Speedrun type succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun type could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
