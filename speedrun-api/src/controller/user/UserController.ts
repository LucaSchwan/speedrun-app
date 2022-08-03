/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../data-source';
import User from '../../entities/user/User';
import UserSession from '../../entities/user/UserSession';
import Result, { Message } from '../../helper/Result';
import Route from '../../helper/Route';
import UserRoleService from '../../services/UserRoleService';
import UserService from '../../services/UserService';

export default class UserController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/users',
      controller: UserController,
      action: 'all',
      auth: 'none',
    },
    {
      method: 'get',
      route: '/users/:id',
      controller: UserController,
      action: 'one',
      auth: 'none',
    },
    {
      method: 'post',
      route: '/users',
      controller: UserController,
      action: 'create',
      auth: 'admin',
    },
    {
      method: 'put',
      route: '/users/:id',
      controller: UserController,
      action: 'update',
      auth: 'admin',
    },
    {
      method: 'delete',
      route: '/users/:id',
      controller: UserController,
      action: 'remove',
      auth: 'admin',
    },
    {
      method: 'put',
      route: '/users/:id/add-role',
      controller: UserController,
      action: 'addRole',
      auth: 'session',
    },
  ];

  private userRepository = AppDataSource.getRepository(User);

  private userService = new UserService();

  private userRoleService = new UserRoleService();

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<User[]>> {
    const { name } = request.query;
    let where: FindOptionsWhere<User>[];
    if (name) where = [{ name: name as string }];
    const user = await this.userRepository.find({
      where,
      relations: ['roles'],
    });
    return user == null
      ? Result.fromError({
          message: 'No users found',
          status: 404,
        })
      : Result.fromResult(user);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<User>> {
    const user = await this.userRepository.findOne({
      where: {
        id: Number(request.params.id),
      },
      relations: ['roles'],
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
    next: NextFunction,
    session: UserSession
  ): Promise<Result<User>> {
    const { email, name, password } = request.body;
    return this.userService.createUser(email, password, name);
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<User>> {
    const id = Number(request.params.id);
    const { email, name, password } = request.body;
    return this.userService.updateUser(id, name, email, password);
  }

  async remove(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Message>> {
    const id = Number(request.params.id);
    return this.userService.removeUser(id);
  }

  async addRole(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Message>> {
    const id = Number(request.params.id);
    const { roleId, name } = request.body;
    const roleMaybe = await this.userRoleService.getUserRole(roleId, name);
    if (roleMaybe.error) {
      return Result.fromError(roleMaybe.error);
    }

    return this.userService.addRole(id, roleMaybe.result);
  }
}
