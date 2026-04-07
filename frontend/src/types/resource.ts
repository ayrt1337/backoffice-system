export interface Breadcrumb {
    label: string;
    path?: string;
}

export interface ResourceMetadata {
    name: string;
    label: string;
    pluralLabel: string;
    tableLabels: string[];
    breadcrumbs: Breadcrumb[];
}
