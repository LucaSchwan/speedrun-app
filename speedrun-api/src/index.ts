/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import Routes from './routes';
import Result from './helper/Result';
import UserSessionService from './services/UserSessionService';
import UserSession from './entities/user/UserSession';

AppDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        `/api/v1${route.route}`,
        async (req: Request, res: Response, next: Function) => {
          const sessionService = new UserSessionService();
          const { sessionId } = req.body;
          let session: UserSession = null;
          if (sessionId != null) {
            const sessionMaybe = await sessionService.getSession(sessionId);
            if (sessionMaybe.error) {
              res.status(sessionMaybe.error.status).json(sessionMaybe.error);
            }

            const validatingResult = await sessionService.validateSession(
              sessionMaybe.result
            );
            if (validatingResult.error) {
              res
                .status(validatingResult.error.status)
                .json(validatingResult.error);
            }
            session = sessionMaybe.result;
          }

          const routeFunction: Promise<Result<any>> =
            new (route.controller as any)()[route.action](
              req,
              res,
              next,
              session
            );
          routeFunction.then((result) => {
            if (result.error == null) {
              res.json(result.result);
            } else {
              if (result.error.status !== undefined) {
                res.status(result.error.status);
              }
              res.json({
                message: result.error.message,
                innerError: result.error.innerError,
              });
            }
          });
        }
      );
    });

    // setup express app here

    // start express server
    app.listen(3000);

    console.log('Speedrun-API has started on port 3000');
  })
  .catch((error) => console.log(error));
