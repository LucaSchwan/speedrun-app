/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import User from '../../entities/user/User';
import { AppDataSource } from '../../data-source';
import Result, { Message } from '../../helper/Result';
import Route from '../../helper/Route';
import UserService from '../../services/UserService';
import UserSession from '../../entities/user/UserSession';
import UserRoleService from '../../services/UserRoleService';

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
    next: NextFunction,
    session: UserSession
  ): Promise<Result<User[]>> {
    const user = await this.userRepository.find();
    });
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
    next: NextFunction,
    session: UserSession
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
    let id: number;
    if (request.params.id) {
      id = Number(request.params.id);
      // but should be admin to update other users
    }
    if (session != null) {
      id = session.user.id;
    } else {
      return Result.fromError({
        message: 'No Id to update',
        status: 401,
      });
    }

    const { email, name, password } = request.body;
    return this.userService.updateUser(id, name, email, password);
  }

  async remove(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Message>> {
    let id: number;
    if (request.params.id) {
      id = Number(request.params.id);
      // but should be admin to delete other users
    }
    if (session != null) {
      id = session.user.id;
    } else {
      return Result.fromError({
        message: 'No Id to update',
        status: 401,
      });
    }

    return this.userService.removeUser(id);
  }
}
