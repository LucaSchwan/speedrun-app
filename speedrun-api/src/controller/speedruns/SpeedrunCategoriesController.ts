/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import SpeedrunCategory from '../../entities/speedruns/SpeedrunCategory';
import { AppDataSource } from '../../data-source';
import Result from '../../helper/Result';
import Route from '../../helper/Route';

export default class SpeedrunCategoriesController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedrun-categories',
      controller: SpeedrunCategoriesController,
      action: 'all',
    },
    {
      method: 'get',
      route: '/speedrun-categories/:id',
      controller: SpeedrunCategoriesController,
      action: 'one',
    },
    {
      method: 'post',
      route: '/speedrun-categories',
      controller: SpeedrunCategoriesController,
      action: 'create',
    },
    {
      method: 'put',
      route: '/speedrun-categories/:id',
      controller: SpeedrunCategoriesController,
      action: 'update',
    },
    {
      method: 'delete',
      route: '/speedrun-categories/:id',
      controller: SpeedrunCategoriesController,
      action: 'remove',
    },
  ];

  private speedrunCategoryRepository =
    AppDataSource.getRepository(SpeedrunCategory);

  async all(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunCategory[]>> {
    const user = await this.speedrunCategoryRepository.find();
    return user == null
      ? Result.fromError({
          message: 'No Speedrun-Categories found',
          status: 404,
        })
      : Result.fromResult(user);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunCategory>> {
    const user = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    return user == null
      ? Result.fromError({
          message: 'Speedrun-Category not found',
          status: 404,
        })
      : Result.fromResult(user);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunCategory>> {
    try {
      const result = await this.speedrunCategoryRepository.save(request.body);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating Speedrun-Category',
        status: 400,
        innerError: e,
      });
    }
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunCategory>> {
    const user = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (user == null) {
      return Result.fromError({
        message: 'Speedrun-Category to update not found',
        status: 404,
      });
    }

    user.name = request.body.name ?? user.name;
    user.description = request.body.description ?? user.description;

    try {
      const result = await this.speedrunCategoryRepository.save(user);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating Speedrun-Category',
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
      await this.speedrunCategoryRepository.findOneBy({
        id: Number(request.params.id),
      });
    if (speedrunCategoryToRemove == null) {
      return Result.fromError({
        message: 'Speedrun-Category to delete was not found',
        status: 404,
      });
    }
    try {
      await this.speedrunCategoryRepository.remove(speedrunCategoryToRemove);
      return Result.fromResult({
        message: 'Speedrun-Category succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun-Category could not be removed',
        status: 500,
      });
    }
  }
}
