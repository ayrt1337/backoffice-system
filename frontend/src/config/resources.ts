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
        ],
        exportLabels: ['Cargo', 'Criação', 'Última Alteração'],
        exportOrders: [
            { label: 'Criação (Mais Recente)', value: 'created_newest' },
            { label: 'Criação (Mais Antiga)', value: 'created_oldest' },
            { label: 'Última Alteração (Mais Recente)', value: 'updated_newest' },
            { label: 'Última Alteração (Mais Antiga)', value: 'updated_oldest' },
            { label: 'Ordem Alfabética (Nome)', value: 'alphabetical_name' },
            { label: 'Ordem Alfabética (Cargo)', value: 'alphabetical_role' },
        ]
    },
    roles: {
        name: 'roles',
        label: 'Cargo',
        pluralLabel: 'Cargos',
        tableLabels: ['Nome', 'Criação', 'Última Alteração'],
        breadcrumbs: [
            { label: 'Cargos', path: '/roles' }
        ],
        exportLabels: ['Criação', 'Última Alteração'],
        exportOrders: [
            { label: 'Criação (Mais Recente)', value: 'created_newest' },
            { label: 'Criação (Mais Antiga)', value: 'created_oldest' },
            { label: 'Última Alteração (Mais Recente)', value: 'updated_newest' },
            { label: 'Última Alteração (Mais Antiga)', value: 'updated_oldest' },
            { label: 'Ordem Alfabética', value: 'alphabetical' },
        ]
    }
};
