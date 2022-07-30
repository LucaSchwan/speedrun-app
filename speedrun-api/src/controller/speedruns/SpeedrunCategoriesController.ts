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
    const categories = await this.speedrunCategoryRepository.find();
    return categories == null
      ? Result.fromError({
          message: 'Error getting Speedrun-Categories',
          status: 404,
        })
      : Result.fromResult(categories);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<SpeedrunCategory>> {
    const category = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    return category == null
      ? Result.fromError({
          message: 'Speedrun-Category not found',
          status: 404,
        })
      : Result.fromResult(category);
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
    const category = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (category == null) {
      return Result.fromError({
        message: 'Speedrun-Category to update not found',
        status: 404,
      });
    }

    category.name = request.body.name ?? category.name;
    category.description = request.body.description ?? category.description;

    try {
      const result = await this.speedrunCategoryRepository.save(category);
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
    const categoryToRemove = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (categoryToRemove == null) {
      return Result.fromError({
        message: 'Speedrun-Category to delete was not found',
        status: 404,
      });
    }
    try {
      await this.speedrunCategoryRepository.remove(categoryToRemove);
      return Result.fromResult({
        message: 'Speedrun-Category succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun-Category could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
