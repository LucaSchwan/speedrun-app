/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../data-source';
import UserRole from '../../entities/user/UserRole';
import UserSession from '../../entities/user/UserSession';
import Result, { Message } from '../../helper/Result';
import Route from '../../helper/Route';
import UserRoleService from '../../services/UserRoleService';

export default class UserRoleController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/user-roles',
      controller: UserRoleController,
      action: 'all',
      auth: 'none',
    },
    {
      method: 'get',
      route: '/user-roles/:id',
      controller: UserRoleController,
      action: 'one',
      auth: 'none',
    },
    {
      method: 'post',
      route: '/user-roles',
      controller: UserRoleController,
      action: 'create',
      auth: 'admin',
    },
    {
      method: 'put',
      route: '/user-roles/:id',
      controller: UserRoleController,
      action: 'update',
      auth: 'admin',
    },
    {
      method: 'delete',
      route: '/users-roles/:id',
      controller: UserRoleController,
      action: 'remove',
      auth: 'admin',
    },
  ];

  private userRoleRepository = AppDataSource.getRepository(UserRole);

  private userRoleService = new UserRoleService();

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<UserRole[]>> {
    const { name, description } = request.query;
    let where: FindOptionsWhere<UserRole>[];
    if (name) where = [{ name: name as string }];
    if (description) where.push({ description: description as string });
    const userRoles = await this.userRoleRepository.find({ where });
    return userRoles == null
      ? Result.fromError({
          message: 'No user roles found',
          status: 404,
        })
      : Result.fromResult(userRoles);
  }

  async one(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<UserRole>> {
    const userRole = await this.userRoleRepository.findOneBy({
      id: Number(request.params.id),
    });
    return userRole == null
      ? Result.fromError({
          message: 'User role not found',
          status: 404,
        })
      : Result.fromResult(userRole);
  }

  async create(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<UserRole>> {
    const { name, description } = request.body;
    return this.userRoleService.createUserRole(name, description);
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<UserRole>> {
    const id = Number(request.params.id);
    const { name, description } = request.body;
    return this.userRoleService.updateUserRole(id, name, description);
  }

  async remove(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<Message>> {
    const id = Number(request.params.id);
    return this.userRoleService.removeUserRole(id);
  }
}
