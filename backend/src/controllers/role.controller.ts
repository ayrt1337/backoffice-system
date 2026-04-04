import { Request, Response, NextFunction } from 'express';
import database from '../config/database.js';
import clientRedis from '../config/redis-client.js';
import { updatePermissions } from '../services/update-permissions.js';
import { verifyPermissions } from '../services/verify-permissions.js';
import { AppError } from '../errors/app-error.js';

export class RoleController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read"])) {
        throw new AppError('Unauthorized', 403);
      }

      const roles = await database.role.findMany({
        select: { name: true }
      });
      return res.status(200).json({ roles });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:create"])) {
        throw new AppError('Unauthorized', 403);
      }

      const { name } = req.body;

      await database.role.create({
        data: { name }
      });

      return res.status(200).json('Success');
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:update"])) {
        throw new AppError('Unauthorized', 403);
      }

      const { name } = req.params as { name: string };

      const role = await database.role.findUnique({
        where: { name },
        select: { name: true }
      });

      if (!role) {
        throw new AppError('Role Not Found', 404);
      }

      const resources = await database.resource.findMany({
        select: {
          name: true,
          label: true,
          actions: {
            select: {
              label: true,
              slug: true
            },
          },
        },
      });

      const permissions = await clientRedis.get('permissions');
      let rolePermissions = [];

      if (permissions) {
        const permissionsJson = JSON.parse(permissions.toString());
        rolePermissions = permissionsJson[name] || [];
      }

      return res.status(200).json({ resources, role, rolePermissions });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!await verifyPermissions(user.role.name, ["roles:read", "roles:update"])) {
        throw new AppError('Unauthorized', 403);
      }

      const { name } = req.params as { name: string };
      const { permissions } = req.body;

      const role = await database.role.findUnique({
        where: { name }
      });

      if (!role) {
        throw new AppError('Role Not Found', 404);
      }

      await database.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({
          where: { roleId: role.id }
        });

        for (const permission of permissions) {
          const permissionData = await tx.action.findUnique({
            where: { slug: permission }
          });

          if (permissionData) {
            await tx.rolePermission.create({
              data: {
                roleId: role.id,
                actionId: permissionData.id
              }
            });
          }
        }
      });

      await updatePermissions();

      return res.status(200).json('Success');
    } catch (error) {
      next(error);
    }
  }
}
