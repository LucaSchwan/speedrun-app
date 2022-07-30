import UserController from './controller/UserController';
import SpeedrunCategoriesController from './controller/speedruns/SpeedrunCategoriesController';
import SpeedrunGroupsController from './controller/speedruns/SpeedrunGroupsController';

const Routes = [
  ...UserController.routes,
  ...SpeedrunCategoriesController.routes,
  ...SpeedrunGroupsController.routes,
];

export default Routes;
