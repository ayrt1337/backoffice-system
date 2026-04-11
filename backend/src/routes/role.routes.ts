import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const roleRoutes = Router();
const roleController = new RoleController();

roleRoutes.use(authenticate);

roleRoutes.get('/', roleController.index);
roleRoutes.get('/create', roleController.resources);
roleRoutes.post('/create', roleController.create);
roleRoutes.get('/:name', roleController.show);
roleRoutes.patch('/edit/:name', roleController.update);
roleRoutes.delete('/delete', roleController.delete);

export { roleRoutes };
