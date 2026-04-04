import database from "../config/database.js";
import clientRedis from "../config/redis-client.js";

const permissionJSON = async (): Promise<Object> => {
    const permissionRoles = await database.rolePermission.findMany({
        include: { role: true, action: true }
    });

    const permissionsJson = {};
    for (const permissionRole of permissionRoles) {
        if (permissionsJson[permissionRole.role.name]) {
            permissionsJson[permissionRole.role.name] = [...permissionsJson[permissionRole.role.name], permissionRole.action.slug];
            continue;
        }

        permissionsJson[permissionRole.role.name] = [permissionRole.action.slug];
    }

    return permissionsJson;
};

export const updatePermissions = async () => {
    const json = await permissionJSON();
    await clientRedis.set("permissions", JSON.stringify(json));
};