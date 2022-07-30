import UserController from './controller/UserController';
import SpeedrunCategoriesController from './controller/speedruns/SpeedrunCategoriesController';
import SpeedrunGroupsController from './controller/speedruns/SpeedrunGroupsController';
import SpeedrunTypesController from './controller/speedruns/SpeedrunTypeController';
import SpeedrunsController from './controller/speedruns/SpeedrunsController';

const Routes = [
  ...UserController.routes,
  ...SpeedrunCategoriesController.routes,
  ...SpeedrunGroupsController.routes,
  ...SpeedrunTypesController.routes,
  ...SpeedrunsController.routes,
];

export default Routes;
