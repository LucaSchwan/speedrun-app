/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import SpeedrunCategory from '../../entities/speedruns/SpeedrunCategory';
import { AppDataSource } from '../../data-source';
import Result, { Message } from '../../helper/Result';
import Route from '../../helper/Route';
import UserSession from '../../entities/user/UserSession';

export default class SpeedrunCategoriesController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/speedrun-categories',
      controller: SpeedrunCategoriesController,
      action: 'all',
      auth: 'none',
    },
    {
      method: 'get',
      route: '/speedrun-categories/:id',
      controller: SpeedrunCategoriesController,
      action: 'one',
      auth: 'none',
    },
    {
      method: 'post',
      route: '/speedrun-categories',
      controller: SpeedrunCategoriesController,
      action: 'create',
      auth: 'session',
    },
    {
      method: 'put',
      route: '/speedrun-categories/:id',
      controller: SpeedrunCategoriesController,
      action: 'update',
      auth: 'session',
    },
    {
      method: 'delete',
      route: '/speedrun-categories/:id',
      controller: SpeedrunCategoriesController,
      action: 'remove',
      auth: 'session',
    },
  ];

  private speedrunCategoryRepository =
    AppDataSource.getRepository(SpeedrunCategory);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunCategory[]>> {
    const categories = await this.speedrunCategoryRepository.find();
    return categories == null
      ? Result.fromError({
          message: 'Error getting speedrun categories',
          status: 404,
        })
      : Result.fromResult(categories);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunCategory>> {
    const category = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    return category == null
      ? Result.fromError({
          message: 'Speedrun category not found',
          status: 404,
        })
      : Result.fromResult(category);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SpeedrunCategory>> {
    try {
      const result = await this.speedrunCategoryRepository.save(request.body);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating speedrun category',
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
    const { name, description } = request.body;
    const category = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (category == null) {
      return Result.fromError({
        message: 'Speedrun category to update not found',
        status: 404,
      });
    }

    category.name = name ?? category.name;
    category.description = description ?? category.description;
    try {
      const result = await this.speedrunCategoryRepository.save(category);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating speedrun category',
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
    const categoryToRemove = await this.speedrunCategoryRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (categoryToRemove == null) {
      return Result.fromError({
        message: 'Speedrun category to delete was not found',
        status: 404,
      });
    }
    try {
      await this.speedrunCategoryRepository.remove(categoryToRemove);
      return Result.fromResult({
        message: 'Speedrun category succesfully removed',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Speedrun category could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
