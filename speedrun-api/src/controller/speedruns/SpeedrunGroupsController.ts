/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import SpeedrunGroup from '../../entities/speedruns/SpeedrunGroup';
import { AppDataSource } from '../../data-source';
import Result, { Message } from '../../helper/Result';
import Route from '../../helper/Route';
import SpeedrunCategory from '../../entities/speedruns/SpeedrunCategory';
import UserSession from '../../entities/user/UserSession';

export default class SpeedrunGroupsController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedrun-groups',
      controller: SpeedrunGroupsController,
      action: 'all',
      auth: 'none',
    },
    {
      method: 'get',
      route: '/speedrun-groups/:id',
      controller: SpeedrunGroupsController,
      action: 'one',
      auth: 'none',
    },
    {
      method: 'post',
      route: '/speedrun-groups',
      controller: SpeedrunGroupsController,
      action: 'create',
      auth: 'session',
    },
    {
      method: 'put',
      route: '/speedrun-groups/:id',
      controller: SpeedrunGroupsController,
      action: 'update',
      auth: 'session',
    },
    {
      method: 'delete',
      route: '/speedrun-groups/:id',
      controller: SpeedrunGroupsController,
      action: 'remove',
      auth: 'session',
    },
  ];

  private speedrunGroupRepository = AppDataSource.getRepository(SpeedrunGroup);

  private speedrunCategoryRepository =
    AppDataSource.getRepository(SpeedrunCategory);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunGroup[]>> {
    const groups = await this.speedrunGroupRepository.find({
      relations: ['category'],
    });
    return groups == null
      ? Result.fromError({
          message: 'Error getting Speedrun groups',
          status: 404,
        })
      : Result.fromResult(groups);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunGroup>> {
    const group = await this.speedrunGroupRepository.findOne({
      where: {
        id: Number(request.params.id),
      },
      relations: ['category'],
    });
    return group == null
      ? Result.fromError({
          message: 'Speedrun group not found',
          status: 404,
        })
      : Result.fromResult(group);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunGroup>> {
    const { categoryId, name, description } = request.body;
    const category = await this.speedrunCategoryRepository.findOneBy({
      id: categoryId,
    });

    if (category == null) {
      return Result.fromError({
        message: "The speedrun category doesn't exist",
        status: 400,
      });
    }

    const group = new SpeedrunGroup();
    group.name = name;
    group.description = description;
    group.category = category;

    try {
      const result = await this.speedrunGroupRepository.save(group);
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
  ): Promise<Result<SpeedrunGroup>> {
    const { name, description, categoryId } = request.body;
    const group = await this.speedrunGroupRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (group == null) {
      return Result.fromError({
        message: 'Speedrun group to update not found',
        status: 404,
      });
    }

    let category: SpeedrunCategory;
    if (categoryId !== null) {
      category = await this.speedrunCategoryRepository.findOneBy({
        id: categoryId,
      });
    }

    group.name = request.body.name ?? group.name;
    group.description = request.body.description ?? group.description;
    group.category = category;

    try {
      const result = await this.speedrunGroupRepository.save(group);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating speedrun group',
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
    const speedrunCategoryToRemove =
      await this.speedrunGroupRepository.findOneBy({
        id: Number(request.params.id),
      });
    if (speedrunCategoryToRemove == null) {
      return Result.fromError({
        message: 'Speedrun group to delete was not found',
        status: 404,
      });
    }
    try {
      await this.speedrunGroupRepository.remove(speedrunCategoryToRemove);
      return Result.fromResult({
        message: 'Speedrun group succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun group could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
