import { Request, Response, NextFunction } from "express";
import database from "../config/database.js";
import clientRedis from "../config/redis-client.js";
import { updatePermissions } from "../services/update-permissions.js";
import { verifyPermissions } from "../services/verify-permissions.js";
import { AppError } from "../errors/app-error.js";
import { User } from "../types/user.js";

export class RoleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!(await verifyPermissions(user.role.name, ["roles:read"]))) {
        throw new AppError("Unauthorized", 403);
      }

      const rolesRaw = await database.role.findMany({
        select: { name: true },
      });

      const roles = rolesRaw.map((role) => {
        return {
          id: role.name,
        };
      });
      return res.status(200).json({ user: { name: user.name }, roles });
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

      return res.status(200).json({ user: { name: user.name }, resources });
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

      if (
        !(await verifyPermissions(user.role.name, ["roles:read"]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.params as { name: string };

      const role = await database.role.findUnique({
        where: { name },
        select: { name: true },
      });

      if (!role) {
        throw new AppError("Role Not Found", 404);
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

      const permissions = await clientRedis.get("permissions");
      let rolePermissions = [];

      if (permissions) {
        const permissionsJson = JSON.parse(permissions.toString());
        rolePermissions = permissionsJson[name] || [];
      }

      return res.status(200)
        .json({ user: { name: user.name }, resources, role, rolePermissions });
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

      const role = await database.role.findUnique({
        where: { name },
        select: { name: true },
      });

      if (!role) {
        throw new AppError("Role Not Found", 404);
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

      const permissions = await clientRedis.get("permissions");
      let rolePermissions = [];

      if (permissions) {
        const permissionsJson = JSON.parse(permissions.toString());
        rolePermissions = permissionsJson[name] || [];
      }

      return res.status(200)
        .json({ user: { name: user.name }, resources, role, rolePermissions });
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
        throw new AppError("Role Not Found", 404);
      }

      await database.$transaction(async (tx) => {
        await tx.role.update({
          where: { name },
          data: { name: roleName },
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
        !(await verifyPermissions(user.role.name, ["role:read", "role:delete"]))
      ) {
        throw new AppError("Unauthorized", 403);
      }

      const { name } = req.body;

      const role = await database.role.findUnique({
        where: { name },
      });

      if (!role) {
        throw new AppError("Role Not Found", 400);
      }

      await database.role.delete({
        where: { name },
      });

      return res.status(200).json("Success");
    } catch (error) {
      next(error);
    }
  }
}
