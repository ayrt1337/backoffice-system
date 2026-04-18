export interface Role {
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface RoleData {
    role: Role | string | any;
    rolePermissions: string[];
    resources: any;
}
