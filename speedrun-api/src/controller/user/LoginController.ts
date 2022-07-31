/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../data-source';
import User from '../../entities/user/User';
import Result from '../../helper/Result';
import Route from '../../helper/Route';
import UserService from '../../services/UserService';
import UserSession from '../../entities/user/UserSession';
import UserSessionService from '../../services/UserSessionService';

export default class LoginController {
  public static routes: Route[] = [
    {
      method: 'post',
      route: '/login',
      controller: LoginController,
      action: 'login',
    },
    {
      method: 'put',
      route: '/logout',
      controller: LoginController,
      action: 'logout',
    },
    {
      method: 'post',
      route: '/register',
      controller: LoginController,
      action: 'register',
    },
  ];

  private userRepository = AppDataSource.getRepository(User);

  private userService = new UserService();

  private userSessionService = new UserSessionService();

  async login(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<UserSession[]>> {
    const { email, name, password, stayLoggedIn } = request.body;
    let user = await this.userRepository.findOneBy({ name });
    if (user == null) user = await this.userRepository.findOneBy({ email });
    if (user == null) {
      return Result.fromError({
        message: 'Wrong Credentials',
        status: 400,
      });
    }

    const doesPasswordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!doesPasswordMatch) {
      return Result.fromError({
        message: 'Wrong Credentials',
        status: 400,
      });
    }

    const sessionMaybe = await this.userSessionService.create(
      user,
      stayLoggedIn
    );
    if (sessionMaybe.error) {
      return Result.fromError(sessionMaybe.error);
    }

    return Result.fromResult(sessionMaybe.result);
  }

  async logout(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<any>> {
    const { sessionId } = request.body;
    const sessionMaybe = await this.userSessionService.invalidateSession(
      sessionId
    );
    if (sessionMaybe.error) {
      return Result.fromError(sessionMaybe.error);
    }
    return Result.fromResult({ message: 'Logged User out' });
  }

  async register(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Result<UserSession>> {
    const { email, name, password } = request.body;
    const userMaybe = await this.userService.createUser(email, password, name);
    if (userMaybe.error) {
      return Result.fromError(userMaybe.error);
    }
    const user = userMaybe.result;

    const sessionMaybe = await this.userSessionService.create(
      user,
      request.body.stayLoggedIn
    );
    if (sessionMaybe.error) {
      return Result.fromError(sessionMaybe.error);
    }

    return Result.fromResult(sessionMaybe.result);
  }
}
