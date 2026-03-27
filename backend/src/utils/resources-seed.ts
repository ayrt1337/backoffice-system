import { Resources } from "../types/resources.js";

export const systemResources: Resources[] = [
    {
        name: "users",
        label: "Usuários",
        actions: ["create", "read", "update", "delete"]
    },
    {
        name: "roles",
        label: "Cargos",
        actions: ["create", "read", "update", "delete"]
    }
];