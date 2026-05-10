import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.get('/me', authenticate, authController.me);
authRoutes.post('/login', authController.login);
authRoutes.get('/logout', authController.logout);

export { authRoutes };
