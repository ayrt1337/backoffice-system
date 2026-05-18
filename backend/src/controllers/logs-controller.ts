import { Request, Response, NextFunction } from "express";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";
import database from "../config/database.js";
import { logsMessageFormatter } from "../utils/logs-message-formatter.js";
import { AuditLog, LogsListQuery } from "../types/logs.js";
import { generateListPDF } from "../utils/pdf-list-generator.js";
import { generatePDF } from "../utils/pdf-generator.js";
import { formatDate } from "../utils/format-date.js";

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
      });
    } catch (error) {
      next(error);
    }
  }

  async read (req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["logs:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { id } = req.params as { id: string };

      const log = await database.auditLogs.findUnique({
        where: { id }
      });

      if (!log) {
        throw new AppError("Log não encontrado", 404);
      }

      res.status(200).json({ log: { ...log, created_at: formatDate(log.created_at) } });
    } catch (error) {
      next(error);
    }
  }

  async exportLogPDF (req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["logs:read", "logs:export"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { id } = req.params as { id: string };

      const logRaw = await database.auditLogs.findUnique({
        where: { id }
      });

      if (!logRaw) {
        throw new AppError("Log não encontrado", 404);
      }

      const actionMap: Record<string, string> = {
        create: "Criação (create)",
        update: "Edição (update)",
        delete: "Exclusão (delete)",
        login: "Autenticação (login)",
      };
      const actionLabel = actionMap[logRaw.action] || logRaw.action;

      const rows: any[] = [
        { label: "Identificador (ID)", value: logRaw.id },
        { label: "Ação", value: actionLabel },
        { label: "Recurso Afetado", value: logRaw.resource },
        { label: "Autor da Ação", value: logRaw.author ? `${(logRaw.author as any).name} (${(logRaw.author as any).role})` : "Sistema / Externo" },
        { label: "Endereço IP", value: logRaw.ip },
        { label: "Data e Hora", value: new Date(logRaw.created_at).toLocaleString("pt-BR") },
      ];

      if (logRaw.action === "update") {
        rows.push({ label: "Detalhes da Alteração (Antes vs Depois)", value: "" });
        const oldObj = (logRaw.targetItem as any) || {};
        const newObj = (logRaw.newItem as any) || {};
        const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

        for (const key of allKeys) {
          const oldVal = oldObj[key] !== undefined ? JSON.stringify(oldObj[key]) : "—";
          const newVal = newObj[key] !== undefined ? JSON.stringify(newObj[key]) : "—";
          if (oldVal !== newVal) {
            rows.push([
              { label: `[Anterior] ${key}`, value: oldVal },
              { label: `[Novo] ${key}`, value: newVal },
            ]);
          } else {
            rows.push({ label: key, value: oldVal });
          }
        }
      } else if (logRaw.action === "create") {
        rows.push({ label: "Dados do Registro Criado", value: "" });
        const obj = ((logRaw.newItem || logRaw.targetItem) as any) || {};
        for (const key of Object.keys(obj)) {
          rows.push({ label: key, value: obj[key] !== undefined ? JSON.stringify(obj[key]) : "—" });
        }
      } else if (logRaw.action === "delete") {
        rows.push({ label: "Dados do Registro Excluído", value: "" });
        const obj = (logRaw.targetItem as any) || {};
        for (const key of Object.keys(obj)) {
          rows.push({ label: key, value: obj[key] !== undefined ? JSON.stringify(obj[key]) : "—" });
        }
      } else {
        rows.push({ label: "Detalhes Adicionais", value: "" });
        const obj = (logRaw.targetItem as any) || {};
        for (const key of Object.keys(obj)) {
          rows.push({ label: key, value: obj[key] !== undefined ? JSON.stringify(obj[key]) : "—" });
        }
      }

      await generatePDF({
        res,
        title: "Detalhes do Registro de Auditoria",
        filename: `auditoria-${logRaw.id}.pdf`,
        rows,
      });
    } catch (error) {
      next(error);
    }
  }
}
