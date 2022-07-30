import UserController from './controller/UserController';
import SpeedrunCategoriesController from './controller/speedruns/SpeedrunCategories';

const Routes = [
  ...UserController.routes,
  ...SpeedrunCategoriesController.routes,
];

export default Routes;
