import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const userRoutes = Router();
const userController = new UserController();

userRoutes.use(authenticate);

userRoutes.get('/', userController.list);

userRoutes.get('/create', userController.createForGet);
userRoutes.post('/create', userController.createForPost);

userRoutes.get('/:name', userController.read);

userRoutes.get('/edit/:name', userController.updateForGet);
userRoutes.patch('/edit/:name', userController.updateForPatch);

userRoutes.delete('/delete', userController.delete);

export { userRoutes };
