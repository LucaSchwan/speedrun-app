/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import User from '../entities/User';
import { AppDataSource } from '../data-source';
import Result from '../helper/Result';
import Route from '../helper/Route';

export default class UserController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/users',
      controller: UserController,
      action: 'all',
    },
    {
      method: 'get',
      route: '/users/:id',
      controller: UserController,
      action: 'one',
    },
    {
      method: 'post',
      route: '/users',
      controller: UserController,
      action: 'create',
    },
    {
      method: 'put',
      route: '/users/:id',
      controller: UserController,
      action: 'update',
    },
    {
      method: 'delete',
      route: '/users/:id',
      controller: UserController,
      action: 'remove',
    },
  ];

  private userRepository = AppDataSource.getRepository(User);

  async all(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<User[]>> {
    const user = await this.userRepository.find();
    return user == null
      ? Result.fromError({
          message: 'No Users found',
          status: 404,
        })
      : Result.fromResult(user);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<User>> {
    const user = await this.userRepository.findOneBy({
      id: Number(request.params.id),
    });
    return user == null
      ? Result.fromError({
          message: 'User not found',
          status: 404,
        })
      : Result.fromResult(user);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<User>> {
    const userMaybe = await this.userRepository.findOneBy([
      {
        email: request.body.email,
      },
      {
        name: request.body.name,
      },
    ]);
    if (userMaybe != null)
      return Result.fromError({
        message: 'User already exists',
        status: 400,
      });

    const user = new User();
    user.email = request.body.email;
    user.name = request.body.name;
    user.passwordHash = bcrypt.hashSync(
      request.body.password,
      bcrypt.genSaltSync(10)
    );

    try {
      await this.userRepository.save(user);
      return Result.fromResult(user);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating User',
        status: 400,
        innerError: e,
      });
    }
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<User>> {
    const user = await this.userRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (user == null) {
      return Result.fromError({
        message: 'User to update not found',
        status: 404,
      });
    }

    user.email = request.body.email ?? user.email;
    user.name = request.body.name ?? user.name;
    user.passwordHash = bcrypt.hashSync(
      request.body.password,
      bcrypt.genSaltSync(10)
    );

    try {
      const result = await this.userRepository.save(user);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating User',
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
    const userToRemove = await this.userRepository.findOneBy({
      id: Number(request.params.id),
    });
    if (userToRemove == null) {
      return Result.fromError({
        message: 'User to delete was not found',
        status: 404,
      });
    }
    try {
      await this.userRepository.remove(userToRemove);
      return Result.fromResult({ message: 'User succesfully removed' });
    } catch (e) {
      return Result.fromError({
        message: 'User could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
