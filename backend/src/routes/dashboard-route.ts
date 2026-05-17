import { Router } from "express";
import { DashboardController } from "../controllers/dashboard-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.use(authenticate);

dashboardRoutes.get("/metrics", dashboardController.metrics);

export { dashboardRoutes };
