import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const userRoutes = Router();
const userController = new UserController();

userRoutes.use(authenticate);

userRoutes.get('/', userController.index);
userRoutes.post('/', userController.create);

export { userRoutes };
