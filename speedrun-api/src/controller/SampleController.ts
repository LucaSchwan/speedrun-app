/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import SampleEntity from '../entities/SampleEntity';
import UserSession from '../entities/user/UserSession';
import Result from '../helper/Result';
import Route from '../helper/Route';

export default class SampleController {
  public static routes: Route[] = [
    {
      method: 'get',
      route: '/sample',
      controller: SampleController,
      action: 'all',
    },
  ];

  private userRepository = AppDataSource.getRepository(SampleEntity);

  async all(
    request: Request,
    response: Response,
    next: NextFunction,
    session: UserSession
  ): Promise<Result<SampleEntity[]>> {
    const samples = await this.userRepository.find();
    return samples == null
      ? Result.fromError({
          message: 'No Sample found',
          status: 404,
        })
      : Result.fromResult(samples);
  }
}
