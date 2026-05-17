export interface LogAuthor {
  id: string;
  name: string;
  role: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  author?: LogAuthor | null;
  ip: string;
  targetItem?: Record<string, any> | null;
  newItem?: Record<string, any> | null;
  created_at: Date | string;
}

export interface LogsListQuery {
    author?: string,
    author_role?: string,
    created_at?: string,
    resource?: string,
    action?: string,
    target_value?: string,
    page: string
};
