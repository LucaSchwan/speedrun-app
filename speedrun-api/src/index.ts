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
import UserRoleService from './services/UserRoleService';

AppDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      console.log(
        `Registering route: 
  Method: ${route.method.toLocaleUpperCase()} 
  Route:  ${route.route}
  Controller: ${route.controller.name}
  Auth: ${route.auth}`
      );
      (app as any)[route.method](
        `/api/v1${route.route}`,
        async (req: Request, res: Response, next: Function) => {
          const sessionService = new UserSessionService();
          const userRoleService = new UserRoleService();
          const { sessionId } = req.body;
          let session: UserSession = null;
          if (sessionId != null) {
            const sessionMaybe = await sessionService.getSession(sessionId);
            if (sessionMaybe.error) {
              res.status(sessionMaybe.error.status).json(sessionMaybe.error);
              return;
            }

            const validatingResult = await sessionService.validateSession(
              sessionMaybe.result
            );
            if (validatingResult.error) {
              res
                .status(validatingResult.error.status)
                .json(validatingResult.error);
              return;
            }

            const adminRole = await userRoleService.getUserRole(null, 'admin');
            if (route.auth === 'admin') {
              const userRoles = validatingResult.result.user?.roles ?? null;
              console.log(userRoles);
              if (userRoles == null || !userRoles?.includes(adminRole.result)) {
                res.status(403).json({
                  message: 'You are not authorized to perform this action',
                });
                return;
              }
            }
            session = sessionMaybe.result;
          } else if (route.auth === 'session') {
            res.status(401).json({ message: 'Session is required' });
            return;
          } else if (route.auth === 'admin') {
            res.status(403).json({
              message: 'You are not authorized to perform this action',
            });
            return;
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
