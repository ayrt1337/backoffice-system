import { Request, Response, NextFunction } from "express";
import { generateListPDF } from "../utils/pdf-list-generator.js";
import database from "../config/database.js";
import { updatePermissions } from "../services/update-permissions.js";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";
import { getPermissions } from "../services/get-permissions.js";
import { formatDate } from "../utils/format-date.js";
import { RolesListQuery } from "../types/role.js";

export class RoleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["roles:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, created_at, updated_at, page } =
        req.query as unknown as RolesListQuery;

      const take = 20;
      const currentPage = Number(page) || 1;
      const skip = (currentPage - 1) * take;

      const where = {
        ...(name && { name: { contains: name } }),
        ...(created_at && { created_at: { gte: new Date(created_at) } }),
        ...(updated_at && { updated_at: { gte: new Date(updated_at) } }),
      };

      const [totalCount, rolesRaw] = await database.$transaction([
        database.role.count({ where }),
        database.role.findMany({
          where,
          skip,
          take,
          orderBy: {
            created_at: "desc",
          },
          select: { name: true, created_at: true, updated_at: true },
        }),
      ]);

      const roles = rolesRaw.map((role) => {
        return {
          id: role.name,
          created_at: formatDate(role.created_at),
          updated_at: formatDate(role.updated_at),
        };
      });

      return res.status(200).json({
        data: roles,
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

  async createForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:create",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const resources = await database.resource.findMany({
        select: {
          label: true,
          actions: {
            select: {
              label: true,
              slug: true,
            },
          },
        },
      });

      return res.status(200).json({ resources });
    } catch (error) {
      next(error);
    }
  }

  async createForPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:create",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, rolePermissions } = req.body;

      const roleData = await database.role.findUnique({
        where: { name },
      });

      if (roleData) {
        throw new AppError("Cargo já existente", 400);
      }

      await database.$transaction(async (tx) => {
        const role = await tx.role.create({
          data: { name },
        });

        for (const rolePermission of rolePermissions) {
          const action = await tx.action.findUnique({
            where: {
              slug: rolePermission,
            },
          });

          await tx.rolePermission.create({
            data: {
              roleId: role.id,
              actionId: action.id,
            },
          });
        }
      });

      await updatePermissions();

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async read(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["roles:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const roleDataRaw = await database.role.findUnique({
        where: { name },
        select: { name: true, created_at: true, updated_at: true },
      });

      if (!roleDataRaw) {
        throw new AppError("Role Not Found", 404);
      }

      const role = {
        ...roleDataRaw,
        created_at: formatDate(roleDataRaw.created_at),
        updated_at: formatDate(roleDataRaw.updated_at),
      };

      const resources = await database.resource.findMany({
        select: {
          label: true,
          actions: {
            select: {
              label: true,
              slug: true,
            },
          },
        },
      });

      const rolePermissions = await getPermissions(role.name);

      return res.status(200).json({ resources, role, rolePermissions });
    } catch (error) {
      next(error);
    }
  }

  async updateForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:update",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const roleDataRaw = await database.role.findUnique({
        where: { name },
        select: { name: true, created_at: true, updated_at: true },
      });

      if (!roleDataRaw) {
        throw new AppError("Role Not Found", 404);
      }

      const role = {
        ...roleDataRaw,
        created_at: formatDate(roleDataRaw.created_at),
        updated_at: formatDate(roleDataRaw.updated_at),
      };

      const resources = await database.resource.findMany({
        select: {
          label: true,
          actions: {
            select: {
              label: true,
              slug: true,
            },
          },
        },
      });

      const rolePermissions = await getPermissions(role.name);

      return res.status(200).json({ resources, role, rolePermissions });
    } catch (error) {
      next(error);
    }
  }

  async updateForPatch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:update",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };
      const { roleName, permissions } = req.body;

      const role = await database.role.findUnique({
        where: { name },
      });

      if (!role) {
        throw new AppError("Cargo não encontrado", 404);
      }

      if (role.name === "admin") {
        throw new AppError("Não é possível editar o admin", 400);
      }

      if (user.role.name === role.name) {
        throw new AppError("Não é possível editar a si mesmo", 400);
      }

      const verifyRole = await database.role.findUnique({
        where: { name: roleName },
      });

      if (verifyRole && name !== roleName) {
        throw new AppError("Cargo já existente", 400);
      }

      await database.$transaction(async (tx) => {
        await tx.role.update({
          where: { name },
          data: { name: roleName, updated_at: new Date() },
        });

        await tx.rolePermission.deleteMany({
          where: { roleId: role.id },
        });

        for (const permission of permissions) {
          const permissionData = await tx.action.findUnique({
            where: { slug: permission },
          });

          if (permissionData) {
            await tx.rolePermission.create({
              data: {
                roleId: role.id,
                actionId: permissionData.id,
              },
            });
          }
        }
      });

      await updatePermissions();

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:delete",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { names } = req.body;

      if (names.includes("admin")) {
        throw new AppError("Cargo admin não pode ser deletado", 400);
      }

      for (const name of names) {
        const role = await database.role.findUnique({
          where: { name },
        });

        if (!role) {
          throw new AppError("Role Not Found", 404);
        }
      }

      await database.$transaction(async (tx) => {
        for (const name of names) {
          await tx.role.delete({
            where: { name },
          });
        }
      });

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }

  async exportListPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (
        !(await verifyPermissions(user.role.name, [
          "roles:read",
          "roles:export",
        ]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { fields, orderBy, orderByLabel, maxItems } = req.query as {
        fields?: string;
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

      const fieldMap: Record<string, string> = {
        "Criação": "created_at",
        "Última Alteração": "updated_at",
      };

      const selectedLabels = fields
        ? fields.split(",")
        : ["Criação", "Última Alteração"];
      const selectedFields = selectedLabels
        .map((label) => fieldMap[label])
        .filter(Boolean);

      let prismaOrderBy: any = { created_at: "desc" };
      if (orderBy === "criacao_antiga") prismaOrderBy = { created_at: "asc" };
      if (orderBy === "alteracao_recente") prismaOrderBy = { updated_at: "desc" };
      if (orderBy === "alteracao_antiga") prismaOrderBy = { updated_at: "asc" };
      if (orderBy === "alfabetica") prismaOrderBy = { name: "asc" };

      const roles = await database.role.findMany({
        orderBy: prismaOrderBy,
        take: maxItems ? Number(maxItems) : null,
        select: {
          name: true,
          created_at: selectedFields.includes("created_at"),
          updated_at: selectedFields.includes("updated_at"),
        },
      });

      await generateListPDF({
        res,
        title: "Relatório de Cargos",
        filename: "relatorio-cargos.pdf",
        data: roles,
        headers: [
          { label: "Nome", property: "name" },
          ...selectedLabels.map((label) => ({
            label,
            property: fieldMap[label],
          })),
        ],
        orderByLabel,
      });
    } catch (error) {
      next(error);
    }
  }
}
