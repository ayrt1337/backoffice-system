import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createRoleSchema, editRoleSchema } from '../schemas/role-schema.js';

const roleRoutes = Router();
const roleController = new RoleController();

roleRoutes.use(authenticate);

roleRoutes.get('/', roleController.list);

roleRoutes.get('/create', roleController.createForGet);
roleRoutes.post('/create', validate(createRoleSchema), roleController.createForPost);

roleRoutes.get('/export', roleController.exportListPDF);

roleRoutes.get('/:name', roleController.read);

roleRoutes.get('/edit/:name', roleController.updateForGet);
roleRoutes.patch('/edit/:name', validate(editRoleSchema), roleController.updateForPatch);

roleRoutes.delete('/delete', roleController.delete);

export { roleRoutes };
