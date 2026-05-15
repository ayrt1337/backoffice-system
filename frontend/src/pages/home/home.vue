<script setup lang="ts">
import { computed } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { useUser } from '../../composables/useUser';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faUsers, 
    faShieldHalved, 
    faChartLine
} from '@fortawesome/free-solid-svg-icons';

const { showUser } = useUser();

const firstName = computed(() => {
    if (!showUser.value.name) return '';
    return showUser.value.name.split(' ')[0];
});

const quickActions = [
    {
        title: 'Dashboard',
        description: 'Visualize métricas e indicadores de desempenho do sistema.',
        icon: faChartLine,
        link: '/dashboard',
        permission: 'dashboard:read'
    },
    {
        title: 'Usuários',
        description: 'Gerencie contas de usuários, permissões e acessos.',
        icon: faUsers,
        link: '/users?page=1',
        permission: 'users:read'
    },
    {
        title: 'Cargos',
        description: 'Configure níveis de acesso e responsabilidades.',
        icon: faShieldHalved,
        link: '/roles?page=1',
        permission: 'roles:read'
    }
];

const filteredActions = computed(() => {
    return quickActions.filter(action => 
        showUser.value.permissions.includes(action.permission) || showUser.value.name === 'admin'
    );
});

const currentHour = new Date().getHours();
const greeting = computed(() => {
    if (currentHour < 12 && currentHour > 5) return 'Bom dia';
    if (currentHour < 18) return 'Boa tarde';
    return 'Boa noite';
});
</script>

<template>
    <TemplatePage>
        <div class="max-w-6xl mx-auto mt-8 space-y-12 pb-12">
            <section class="relative overflow-hidden rounded-3xl bg-blue-600 p-8 md:p-12 text-white shadow-2xl">
                <div class="relative z-10 space-y-6 max-w-2xl">     
                    <div class="space-y-2">
                        <h1 class="text-4xl md:text-5xl font-bold">
                            {{ greeting }}, <span class="text-blue-200">{{ firstName }}</span>!
                        </h1>
                        <p class="text-lg md:text-xl text-blue-100/90">
                            Aqui você pode gerenciar todos os aspectos do sistema de forma rápida e intuitiva.
                        </p>
                    </div>
                </div>
            </section>

            <section class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <router-link 
                        v-for="action in filteredActions" 
                        :key="action.title"
                        :to="action.link"
                        class="min-h-[220px] p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4"
                    >
                        <div 
                            class="bg-blue-50 text-blue-600 w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                        >
                            <FontAwesomeIcon :icon="action.icon" />
                        </div>

                        <div class="space-y-2">
                            <h3 class="text-xl font-bold text-slate-800">
                                {{ action.title }}
                            </h3>
                            <p class="text-slate-500 text-[15px]">
                                {{ action.description }}
                            </p>
                        </div>
                    </router-link>
                </div>
            </section>
        </div>
    </TemplatePage>
</template>
