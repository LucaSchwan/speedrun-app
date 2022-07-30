/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import SpeedrunGroup from '../../entities/speedruns/SpeedrunGroup';
import { AppDataSource } from '../../data-source';
import Result from '../../helper/Result';
import Route from '../../helper/Route';
import SpeedrunCategory from '../../entities/speedruns/SpeedrunCategory';

export default class SpeedrunGroupsController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedrun-groups',
      controller: SpeedrunGroupsController,
      action: 'all',
    },
    {
      method: 'get',
      route: '/speedrun-groups/:id',
      controller: SpeedrunGroupsController,
      action: 'one',
    },
    {
      method: 'post',
      route: '/speedrun-groups',
      controller: SpeedrunGroupsController,
      action: 'create',
    },
    {
      method: 'put',
      route: '/speedrun-groups/:id',
      controller: SpeedrunGroupsController,
      action: 'update',
    },
    {
      method: 'delete',
      route: '/speedrun-groups/:id',
      controller: SpeedrunGroupsController,
      action: 'remove',
    },
  ];

  private speedrunGroupRepository = AppDataSource.getRepository(SpeedrunGroup);

  private speedrunCategoryRepository =
    AppDataSource.getRepository(SpeedrunCategory);

  async all(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunGroup[]>> {
    const groups = await this.speedrunGroupRepository.find();
    return groups == null
      ? Result.fromError({
          message: 'Error getting Speedrun-Groups',
          status: 404,
        })
      : Result.fromResult(groups);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunGroup>> {
    const group = await this.speedrunGroupRepository.findOneBy({
      id: Number(request.params.id),
    });
    return group == null
      ? Result.fromError({
          message: 'Speedrun-Group not found',
          status: 404,
        })
      : Result.fromResult(group);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunGroup>> {
    const category = await this.speedrunCategoryRepository.findOneBy({
      id: request.body.categoryId,
    });

    if (category == null) {
      return Result.fromError({
        message: "The Speedrun-Group doesn't exist",
        status: 400,
      });
    }

    try {
      const group = new SpeedrunGroup();
      group.name = request.body.name;
      group.description = request.body.description;
      group.category = category;
      const result = await this.speedrunGroupRepository.save(group);
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
  ): Promise<Result<SpeedrunGroup>> {
    const group = await this.speedrunGroupRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (group == null) {
      return Result.fromError({
        message: 'Speedrun-Group to update not found',
        status: 404,
      });
    }

    const { categoryId } = request.body;
    let category: SpeedrunCategory;
    if (categoryId !== null) {
      category = await this.speedrunCategoryRepository.findOneBy({
        id: categoryId,
      });
      group.category = category;
    }

    group.name = request.body.name ?? group.name;
    group.description = request.body.description ?? group.description;

    try {
      const result = await this.speedrunGroupRepository.save(group);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating Speedrun-Group',
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
    const speedrunCategoryToRemove =
      await this.speedrunGroupRepository.findOneBy({
        id: Number(request.params.id),
      });
    if (speedrunCategoryToRemove == null) {
      return Result.fromError({
        message: 'Speedrun-Group to delete was not found',
        status: 404,
      });
    }
    try {
      await this.speedrunGroupRepository.remove(speedrunCategoryToRemove);
      return Result.fromResult({
        message: 'Speedrun-Group succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun-Group could not be removed',
        status: 500,
      });
    }
  }
}
