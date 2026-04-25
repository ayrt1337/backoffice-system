import { Request, Response, NextFunction } from "express";
import database from "../config/database.js";
import { updatePermissions } from "../services/update-permissions.js";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";
import { getPermissions } from "../services/get-permissions.js";
import { getUserResponse } from "../services/get-user-response.js";
import { formatDate } from "../utils/format-date.js";
import { RolesListQuery } from "../types/role.js";

export class RoleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, created_at, updated_at, page } = req.query as unknown as RolesListQuery;

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
          select: { name: true, created_at: true, updated_at: true },
        })
      ]);
      
      const roles = rolesRaw.map((role) => {
        return {
          id: role.name,
          created_at: formatDate(role.created_at),
          updated_at: formatDate(role.updated_at)
        };
      });

      const userResponse = await getUserResponse(user);

      return res.status(200).json({ 
        user: userResponse, 
        data: roles,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / take),
          currentPage,
          perPage: take
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async createForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:create"])) {
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

      const userResponse = await getUserResponse(user);

      return res.status(200).json({ user: userResponse, resources });
    } catch (error) {
      next(error);
    }
  }

  async createForPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:create"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name, rolePermissions } = req.body;

      if (!name || !rolePermissions) {
        throw new AppError("Preencha os campos", 400);
      }

      const roleData = await database.role.findUnique({
        where: { name }
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

      if (!await verifyPermissions(user.role.name, ["roles:read"])) {
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
          updated_at: formatDate(roleDataRaw.updated_at)
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
      const userResponse = await getUserResponse(user);

      return res.status(200).json({ user: userResponse, resources, role, rolePermissions });
    } catch (error) {
      next(error);
    }
  }

  async updateForGet(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:update"])) {
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
          updated_at: formatDate(roleDataRaw.updated_at)
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
      const userResponse = await getUserResponse(user);

      return res.status(200).json({ user: userResponse, resources, role, rolePermissions });
    } catch (error) {
      next(error);
    }
  }

  async updateForPatch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:update"])) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };
      const { roleName, permissions } = req.body;

      if (!roleName || !permissions) {
        throw new AppError("Preencha os campos", 400);
      }

      const role = await database.role.findUnique({
        where: { name },
      });

      if (!role) {
        throw new AppError("Cargo não encontrado", 404);
      }

      const verifyRole = await database.role.findUnique({
        where: { name: roleName }
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

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:delete"])) {
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
      };

      await database.$transaction(async (tx) => {
        for (const name of names) {
          await tx.role.delete({
            where: { name },
          });
        }
      })

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }
}
