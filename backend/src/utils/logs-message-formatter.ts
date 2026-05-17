import { AuditLog } from "../types/logs.js";
import { formatDate } from "./format-date.js";

export const logsMessageFormatter = (logs: AuditLog[]) => {
  return logs.map((log) => {
    let message = "";

    if (log.author) {
      message += `O usuário ${log.author.name} `;
    } else {
      message += `Um usuário de IP ${log.ip} `;
    }

    const targetName = log.targetItem?.name ? ` ${log.targetItem.name}` : "";

    switch (log.action) {
      case "create": {
        const resourceName =
          log.resource === "users"
            ? "o usuário"
            : log.resource === "roles"
              ? "o cargo"
              : log.resource;
        message += `criou ${resourceName}${targetName}.`;
        break;
      }
      case "update": {
        const resourceName =
          log.resource === "users"
            ? "o usuário"
            : log.resource === "roles"
              ? "o cargo"
              : log.resource;
        message += `editou ${resourceName}${targetName}.`;
        break;
      }
      case "delete": {
        const resourceName =
          log.resource === "users"
            ? "o usuário"
            : log.resource === "roles"
              ? "o cargo"
              : log.resource;
        message += `excluiu ${resourceName}${targetName}.`;
        break;
      }
      case "login": {
        if (log.targetItem?.name) {
          message += `tentou entrar na conta do usuário ${log.targetItem.name}.`;
        } else {
          message += `tentou entrar no sistema.`;
        }
        break;
      }
      default: {
        message += `realizou uma ação em ${log.resource}.`;
        break;
      }
    }

    return {
      message,
      created_at: formatDate(new Date(log.created_at)),
      ip: log.ip,
      action: log.action,
      resource: log.resource,
      author: {
        name: log.author?.name,
        role: log.author?.role,
      }
    };
  });
};
