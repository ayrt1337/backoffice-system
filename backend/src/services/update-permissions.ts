import database from "../config/database.js";
import clientRedis from "../config/redis-client.js";

const permissionJSON = async (): Promise<Object> => {
    const permissionRoles = await database.rolePermissions.findMany({
        include: { role: true, permission: true }
    });

    const permissionsJson = {};
    for (const permissionRole of permissionRoles) {
        if (permissionsJson[permissionRole.role.name]) {
            permissionsJson[permissionRole.role.name] = [...permissionsJson[permissionRole.role.name], permissionRole.permission.slug];
            continue;
        }

        permissionsJson[permissionRole.role.name] = [permissionRole.permission.slug];
    }

    return permissionsJson;
};

export const updatePermissions = async () => {
    const json = await permissionJSON();
    await clientRedis.set("permissions", JSON.stringify(json));
};