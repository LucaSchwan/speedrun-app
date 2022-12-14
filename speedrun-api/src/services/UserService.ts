import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import User from '../entities/user/User';
import UserRole from '../entities/user/UserRole';
import Result, { Message } from '../helper/Result';
import UserRoleService from './UserRoleService';

export default class UserService {
  private userRepository = AppDataSource.getRepository(User);

  private userRoleRepository = AppDataSource.getRepository(UserRole);

  private userRoleService = new UserRoleService();

  async createUser(
    email: string,
    password: string,
    name?: string
  ): Promise<Result<User>> {
    const userMaybe = await this.userRepository.findOneBy([
      {
        email,
      },
      {
        name,
      },
    ]);
    if (userMaybe != null)
      return Result.fromError({
        message: 'User already exists',
        status: 400,
      });

    const user = new User();
    user.email = email;
    user.name = name ?? email;
    user.passwordHash = bcrypt.hashSync(password, 10);

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

  async updateUser(
    id: number,
    name?: string,
    email?: string,
    password?: string
  ): Promise<Result<User>> {
    const user = await this.userRepository.findOneBy({
      id: Number(id),
    });
    if (user == null) {
      return Result.fromError({
        message: 'User to update not found',
        status: 404,
      });
    }

    user.email = email ?? user.email;
    user.name = name ?? user.name;
    user.passwordHash = password
      ? bcrypt.hashSync(password, bcrypt.genSaltSync(10))
      : user.passwordHash;

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

  async removeUser(id: number): Promise<Result<Message>> {
    const userToRemove = await this.userRepository.findOneBy({
      id: Number(id),
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

  async addRole(id: number, role: UserRole): Promise<Result<Message>> {
    const user = await this.userRepository.findOneBy({
      id: Number(id),
    });
    if (user == null) {
      return Result.fromError({
        message: 'User not found',
        status: 404,
      });
    }

    const roleMaybe = await this.userRoleService.getUserRole(role.id);
    if (roleMaybe.error) {
      return Result.fromError(roleMaybe.error);
    }

    if (!user.roles) user.roles = [];
    user.roles.push(roleMaybe.result);

    try {
      await this.userRepository.save(user);
      return Result.fromResult({ message: 'Role added' });
    } catch (e) {
      return Result.fromError({
        message: 'Error adding role to user',
        status: 400,
        innerError: e,
      });
    }
  }
}
