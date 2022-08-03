import { AppDataSource } from '../data-source';
import User from '../entities/user/User';
import UserSession from '../entities/user/UserSession';
import Result from '../helper/Result';

export default class UserSessionService {
  private userSessionRepository = AppDataSource.getRepository(UserSession);

  private userRepository = AppDataSource.getRepository(User);

  public async getSession(sessionId: number): Promise<Result<UserSession>> {
    const session = await this.userSessionRepository.findOne({
      where: {
        id: sessionId,
      },
      relations: ['user', 'user.roles'],
    });

    if (session == null) {
      return Result.fromError({
        message: 'Session not found',
        status: 404,
      });
    }

    return session.expirationDate < new Date()
      ? Result.fromError({
          message: 'Session expired',
          status: 400,
        })
      : Result.fromResult(session);
  }

  public async create(
    user: User,
    stayLoggedIn: boolean
  ): Promise<Result<UserSession>> {
    const userMaybe = await this.userRepository.findOneBy({ id: user.id });
    if (userMaybe == null) {
      return Result.fromError({
        message: 'User not found',
        status: 400,
      });
    }

    const userSessions = await this.userSessionRepository.find({
      where: {
        user: userMaybe,
      },
    });
    if (
      userSessions != null &&
      userSessions.some(
        (session) => session.expirationDate > new Date(Date.now())
      )
    ) {
      return Result.fromError({
        message: 'User already has a session',
        status: 409,
      });
    }

    const session = new UserSession();
    session.user = user;
    session.expirationDate = new Date(
      Date.now() +
        (stayLoggedIn ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 12)
    );
    try {
      const result = await this.userSessionRepository.save(session);
      return Result.fromResult(result);
    } catch (e) {
      return Result.fromError({
        message: 'Error creating UserSession',
        innerError: e,
      });
    }
  }

  public async validateSession(
    session: UserSession
  ): Promise<Result<UserSession>> {
    const userSession = await this.userSessionRepository.findOne({
      where: {
        id: session.id,
        user: session.user,
      },
      relations: ['user', 'user.roles'],
    });

    if (userSession == null) {
      return Result.fromError({
        message: 'Session not found',
        status: 404,
      });
    }

    if (userSession.expirationDate < new Date()) {
      return Result.fromError({
        message: 'Session expired',
        status: 400,
      });
    }
    return Result.fromResult(userSession);
  }

  public async invalidateSession(sessionId: number): Promise<Result<void>> {
    const userSession = await this.userSessionRepository.findOneBy({
      id: sessionId,
    });
    if (userSession == null) {
      return Result.fromError({
        message: 'Session not found',
      });
    }

    userSession.expirationDate = new Date(0);
    try {
      await this.userSessionRepository.save(userSession);
      return Result.fromResult({
        message: 'Session invalidated',
      });
    } catch (e) {
      return Result.fromError({
        message: 'Error invalidating Session',
        innerError: e,
      });
    }
  }
}
