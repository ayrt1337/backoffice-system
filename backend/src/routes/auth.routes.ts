import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', authController.login);
authRoutes.get('/logout', authController.logout);

export { authRoutes };
