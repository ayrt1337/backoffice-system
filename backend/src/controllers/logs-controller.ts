import { Request, Response, NextFunction } from "express";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";
import database from "../config/database.js";
import { logsMessageFormatter } from "../utils/logs-message-formatter.js";
import { AuditLog, LogsListQuery } from "../types/logs.js";
import { generateListPDF } from "../utils/pdf-list-generator.js";

export class LogsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["logs:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { author, author_role, resource, action, target_value, created_at, page } =
        req.query as unknown as LogsListQuery;

      const take = 50;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * take;

      const where = {
        ...(author && {
          OR: [
            { author: { path: ["name"], string_contains: author } },
            { author: { path: ["id"], string_contains: author } },
          ],
        }),
        ...(author_role && { author: { path: ["role"], string_contains: author_role } }),
        ...(resource && { resource: { contains: resource } }),
        ...(action && { action: { contains: action } }),
        ...(target_value && {
          OR: [
            { targetItem: { path: ["name"], string_contains: target_value } },
            { targetItem: { path: ["id"], string_contains: target_value } },
            { newItem: { path: ["name"], string_contains: target_value } },
            { newItem: { path: ["id"], string_contains: target_value } },
          ],
        }),
        ...(created_at && { created_at: { gte: new Date(created_at) } }),
      };

      const [totalCount, logsRaw] = await database.$transaction([
        database.auditLogs.count({ where }),
        database.auditLogs.findMany({
          where,
          skip,
          take,
          orderBy: {
            created_at: "desc",
          }
        }),
      ]);

      const logs = logsMessageFormatter(logsRaw as unknown as AuditLog[]);

      res.status(200).json({ 
        data: logs,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / take),
          currentPage,
          perPage: take,
        }, 
      });
    } catch (error) {
      next(error);
    }
  }

  async exportListPDF (req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["logs:read", "logs:export"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { orderBy, orderByLabel, maxItems } = req.query as {
        orderBy?: string;
        orderByLabel?: string;
        maxItems?: number;
      };
      
      if (typeof Number(maxItems) !== "number") {
        throw new AppError("A quantidade de items deve ser um número!", 400);
      }

      if (Number(maxItems) <= 0) {
        throw new AppError(
          "A quantidade de items deve ser um inteiro positivo!",
          400,
        );
      }

      let prismaOrderBy: any = { created_at: "desc" };
      if (orderBy === "created_oldest") prismaOrderBy = { created_at: "asc" };

      const logsRaw = await database.auditLogs.findMany({
        orderBy: prismaOrderBy,
        take: maxItems ? Number(maxItems) : 50,
      });

      const formattedLogs = logsMessageFormatter(logsRaw as unknown as AuditLog[]);
      const logs = formattedLogs.map((log) => {
        return {
          message: log.message,
          created_at: log.created_at
        }
      });

      await generateListPDF({
        res, 
        title: "Relatório da Auditória",
        filename: "relatorio-auditoria.pdf",
        data: logs,
        headers: [
          { label: "Mensagem", property: "message" },
          { label: "Data", property: "created_at" },
        ],
        orderByLabel
      })
    } catch (error) {
      next(error);
    }
  }
}
