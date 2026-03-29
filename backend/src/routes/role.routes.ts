import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const roleRoutes = Router();
const roleController = new RoleController();

roleRoutes.use(authenticate);

roleRoutes.get('/', roleController.index);
roleRoutes.post('/', roleController.create);
roleRoutes.get('/:name', roleController.show);
roleRoutes.post('/:name', roleController.update);

export { roleRoutes };
