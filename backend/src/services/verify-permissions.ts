import clientRedis from "../config/redis-client.js";
import database from "../config/database.js";
import { AppError } from "../errors/app-error.js";

export const verifyPermissions = async (roleName: string, permissionsNeeded: string[]): Promise<boolean> => {
    const role = await database.role.findUnique({
        where: { name: roleName }
    });

    if (!role) {
        throw new AppError("Role Not Found", 404);
    }

    if (role.name === "admin") {
        return true;
    }

    const permissions = await clientRedis.get("permissions");
    if (!permissions) {
        throw new AppError("Permissions Not Loaded", 500);
    }

    const permissionsData = JSON.parse(permissions.toString());
    const rolePermissions = (permissionsData as Record<string, string[]>)[roleName] || [];

    for (const permission of permissionsNeeded) {
        if (!rolePermissions.includes(permission)) {
            return false;
        }
    }

    return true;
};