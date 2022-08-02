import UserController from './controller/user/UserController';
import SpeedrunCategoriesController from './controller/speedruns/SpeedrunCategoriesController';
import SpeedrunGroupsController from './controller/speedruns/SpeedrunGroupsController';
import SpeedrunTypesController from './controller/speedruns/SpeedrunTypeController';
import SpeedrunsController from './controller/speedruns/SpeedrunsController';
import LoginController from './controller/user/LoginController';
import UserSessionController from './controller/user/UserSessionController';
import UserRoleController from './controller/user/UserRoleController';

const Routes = [
  ...UserController.routes,
  ...LoginController.routes,
  ...UserSessionController.routes,
  ...UserRoleController.routes,
  ...SpeedrunCategoriesController.routes,
  ...SpeedrunGroupsController.routes,
  ...SpeedrunTypesController.routes,
  ...SpeedrunsController.routes,
];

export default Routes;
