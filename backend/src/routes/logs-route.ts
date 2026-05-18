import { Router } from "express";
import { LogsController } from "../controllers/logs-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";

const logsRoutes = Router();
const logsController = new LogsController();

logsRoutes.use(authenticate);

logsRoutes.get("/", logsController.list);

logsRoutes.get("/export", logsController.exportListPDF);
logsRoutes.get("/export/:id", logsController.exportLogPDF);

logsRoutes.get("/:id", logsController.read);

export { logsRoutes };
