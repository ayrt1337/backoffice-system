import { Router } from 'express';
import { authRoutes } from './auth-routes.js';
import { userRoutes } from './user-routes.js';
import { roleRoutes } from './role-routes.js';
import { dashboardRoutes } from './dashboard-route.js';

const routes = Router();

routes.use('/', authRoutes);
routes.use('/users', userRoutes);
routes.use('/roles', roleRoutes);
routes.use('/dashboard', dashboardRoutes);

export { routes };
