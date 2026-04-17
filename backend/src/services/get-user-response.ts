import { getPermissions } from "./get-permissions.js";

export const getUserResponse = async (user: any) => {
    const permissions = await getPermissions(user.role.name);
    return {
        name: user.name,
        permissions
    };
};