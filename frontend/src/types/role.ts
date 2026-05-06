export interface Role {
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ResourceAction {
    label: string;
    slug: string;
}

export interface ResourcePermission {
    label: string;
    actions: ResourceAction[];
}

export interface RoleData {
    role: Role | string;
    rolePermissions: string[];
    resources: ResourcePermission[];
}

