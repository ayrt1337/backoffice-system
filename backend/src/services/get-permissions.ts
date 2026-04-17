import clientRedis from "../config/redis-client.js";

export const getPermissions = async (role: string) => {
    const permissions = await clientRedis.get("permissions");

    if (permissions) {
        const permissionsJson = JSON.parse(permissions.toString());
        return permissionsJson[role] || [];
    }

    return [];
};