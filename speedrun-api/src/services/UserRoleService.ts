import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../data-source';
import User from '../entities/user/User';
import UserRole from '../entities/user/UserRole';
import Result, { Message } from '../helper/Result';

export default class UserRoleService {
  private userRoleRepository = AppDataSource.getRepository(UserRole);

  async getUserRole(id?: number, name?: string): Promise<Result<UserRole>> {
    const where: FindOptionsWhere<UserRole>[] = [];
    if (id) where.push({ id });
    if (name) where.push({ name });
    const userRole = await this.userRoleRepository.findOneBy(where);
    if (userRole == null) {
      return Result.fromError({
        message: 'User role was not found',
        status: 404,
      });
    }
    return Result.fromResult(userRole);
  }

  async createUserRole(
    name: string,
    description: string
  ): Promise<Result<UserRole>> {
    const userRoleMaybe = await this.userRoleRepository.findOneBy({
      name,
    });
    if (userRoleMaybe != null)
      return Result.fromError({
        message: 'User role already exists',
        status: 409,
      });

    const userRole = new UserRole();
    userRole.name = name;
    userRole.description = description;

    try {
      await this.userRoleRepository.save(userRole);
      return Result.fromResult(userRole);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating user role',
        status: 400,
        innerError: e,
      });
    }
  }

  async updateUserRole(
    id: number,
    name?: string,
    description?: string
  ): Promise<Result<UserRole>> {
    const userRole = await this.userRoleRepository.findOneBy({
      id: Number(id),
    });
    if (userRole == null) {
      return Result.fromError({
        message: 'User role to update not found',
        status: 404,
      });
    }

    userRole.name = name ?? userRole.name;
    userRole.description = description ?? userRole.description;

    try {
      const result = await this.userRoleRepository.save(userRole);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error updating user role',
        status: 400,
        innerError: e,
      });
    }
  }

  async removeUserRole(id: number): Promise<Result<Message>> {
    const userRoleToRemove = await this.userRoleRepository.findOneBy({
      id: Number(id),
    });
    if (userRoleToRemove == null) {
      return Result.fromError({
        message: 'User role to delete was not found',
        status: 404,
      });
    }
    try {
      await this.userRoleRepository.remove(userRoleToRemove);
      return Result.fromResult({ message: 'User role succesfully removed' });
    } catch (e) {
      return Result.fromError({
        message: 'User role could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }

  async userHasRole(
    user: User,
    role: string | number
  ): Promise<Result<Message>> {
    const userRole = await this.userRoleRepository.findOneBy([
      {
        id: role as number,
      },
      {
        name: role as string,
      },
    ]);

    if (userRole == null) {
      return Result.fromError({
        message: 'User role not found',
        status: 404,
      });
    }

    return user.roles.includes(userRole)
      ? Result.fromResult({ message: 'User has the role' })
      : Result.fromError({
          message: 'User does not have the role',
          status: 401,
        });
  }
}
