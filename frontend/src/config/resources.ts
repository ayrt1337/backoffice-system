import type { ResourceMetadata } from '../types/resource';

export const resources: Record<string, ResourceMetadata> = {
    dashboard: {
        name: 'dashboard',
        label: 'Dashboard',
        pluralLabel: 'Dashboard',
        tableLabels: [],
        breadcrumbs: [
            { label: 'Dashboard', path: '/dashboard' }
        ]
    },
    users: {
        name: 'users',
        label: 'Usuário',
        pluralLabel: 'Usuários',
        tableLabels: ['Usuário', 'Cargo', 'Criação', 'Última Alteração'],
        breadcrumbs: [
            { label: 'Usuários', path: '/users' }
        ]
    },
    roles: {
        name: 'roles',
        label: 'Cargo',
        pluralLabel: 'Cargos',
        tableLabels: ['Nome', 'Criação', 'Última Alteração'],
        breadcrumbs: [
            { label: 'Cargos', path: '/roles' }
        ]
    }
};
