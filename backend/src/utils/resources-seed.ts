import { Resources } from "../types/resources.js";

export const systemResources: Resources[] = [
    {
        name: "dashboard",
        label: "Dashboard",
        actions: [
            { label: "Visualizar", name: "read" },
        ]
    },
    {
        name: "users",
        label: "Usuários",
        actions: [
            { label: "Visualizar", name: "read" },
            { label: "Criar", name: "create" },
            { label: "Editar", name: "update" }, 
            { label: "Excluir", name: "delete" },
            { label: "Exportar", name: "export" }
        ]
    },
    {
        name: "roles",
        label: "Cargos",
        actions: [
            { label: "Visualizar", name: "read" },
            { label: "Criar", name: "create" },
            { label: "Editar", name: "update" }, 
            { label: "Excluir", name: "delete" }
        ]
    }
];