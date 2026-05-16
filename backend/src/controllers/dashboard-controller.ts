import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import * as services from "../services/index.js";
import { DashboardMetrics } from "../services/dashboard-metrics.js";

export class DashboardController {
  async metrics(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await services.verifyPermissions(user.role.name, ["dashboard:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const cards = await DashboardMetrics.getCards();

      res.status(200).json({
        cards
      });
    } catch (error) {
      next(error);
    }
  }
}
