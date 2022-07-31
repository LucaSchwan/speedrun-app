/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import User from '../../entities/user/User';
import { AppDataSource } from '../../data-source';
import Result from '../../helper/Result';
import Route from '../../helper/Route';
import UserService from '../../services/UserService';

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

  private userService = new UserService();

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
    const { email, name, password } = request.body;
    return this.userService.createUser(email, password, name);
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<User>> {
    const { email, name, password } = request.body;
    return this.userService.updateUser(
      Number(request.params.id),
      name,
      email,
      password
    );
  }

  async remove(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<any>> {
    return this.userService.removeUser(Number(request.params.id));
  }
}
