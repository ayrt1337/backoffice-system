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
            { label: 'Criação (Mais Recente)', value: 'criacao_recente' },
            { label: 'Criação (Mais Antiga)', value: 'criacao_antiga' },
            { label: 'Última Alteração (Mais Recente)', value: 'alteracao_recente' },
            { label: 'Última Alteração (Mais Antiga)', value: 'alteracao_antiga' },
            { label: 'Ordem Alfabética (Nome)', value: 'alfabetica_name' },
            { label: 'Ordem Alfabética (Cargo)', value: 'alfabetica_role' },
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
            { label: 'Criação (Mais Recente)', value: 'criacao_recente' },
            { label: 'Criação (Mais Antiga)', value: 'criacao_antiga' },
            { label: 'Última Alteração (Mais Recente)', value: 'alteracao_recente' },
            { label: 'Última Alteração (Mais Antiga)', value: 'alteracao_antiga' },
            { label: 'Ordem Alfabética', value: 'alfabetica' },
        ]
    }
};
