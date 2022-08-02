import { AppDataSource } from '../data-source';
import UserRole from '../entities/user/UserRole';
import Result, { Message } from '../helper/Result';

export default class UserRoleService {
  private userRoleRepository = AppDataSource.getRepository(UserRole);

  async getUserRole(id: number): Promise<Result<UserRole>> {
    const userRole = await this.userRoleRepository.findOneBy({
      id: Number(id),
    });
    if (userRole == null) {
      return Result.fromError({
        message: 'User-Role was not found',
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
        message: 'User-Role already exists',
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
        message: 'Error creating User-Role',
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
        message: 'User-Role to update not found',
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
        message: 'Error updating User-Role',
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
        message: 'User-Role to delete was not found',
        status: 404,
      });
    }
    try {
      await this.userRoleRepository.remove(userRoleToRemove);
      return Result.fromResult({ message: 'User-Role succesfully removed' });
    } catch (e) {
      return Result.fromError({
        message: 'User-Role could not be removed',
        status: 400,
        innerError: e,
      });
    }
  }
}
