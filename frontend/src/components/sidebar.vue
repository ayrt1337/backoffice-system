<script setup lang="ts">
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUsers, faShieldHalved, faChartLine, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import router from '../router';
import { api } from '../services/api';
import { verifyApiError } from '../services/verifyApiError';
import { useLoading } from '../composables/useLoading';
import { useUser } from '../composables/useUser';

const { showUser } = useUser();
const { showLoadingPage } = useLoading();
const route = useRoute();

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: faChartLine, permission: 'dashboard:read' },
    { name: 'Usuários', path: '/users', icon: faUsers, permission: 'users:read' },
    { name: 'Cargos', path: '/roles', icon: faShieldHalved, permission: 'roles:read' },
];

const filteredItems = menuItems.filter(obj => {
    return showUser.value.permissions.includes(obj.permission) || showUser.value.name === 'admin';
});

const handleLogout = async () => {
    showLoadingPage(true);
    try {
        await api({
            url: "/logout",
            method: "get",
        });

        router.push('/login');
    } catch(error: any) {
        console.error("Erro ao fazer logout: ", error);
        showLoadingPage(false);
        verifyApiError(error.response?.status, false);
    }
};
</script>

<template>
    <aside class="fixed inset-y-0 left-0 top-[87px] w-70 bg-white border-r border-slate-200/60 z-30 transition-all duration-300">
        <div class="flex flex-col h-full">
            <nav class="flex-1 px-4 py-4 flex flex-col justify-between">
                <div class="space-y-8">
                    <div>
                        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-4">Navegação</h3>
                        <div class="space-y-1">
                            <router-link 
                                v-for="item in filteredItems"
                                :key="item.path"
                                :to="item.path"
                                class="flex items-center px-3 py-2 text-[15px] font-medium rounded-xl transition-colors group"
                                :class="route.path.startsWith(item.path) 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                            >
                                <FontAwesomeIcon 
                                    class="text-[16px] mr-2 transition-colors" 
                                    :class="route.path.startsWith(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'"
                                    :icon="item.icon"
                                />

                                {{ item.name }}
                            </router-link>
                        </div>
                    </div>
                </div>

                <div class="mt-auto pt-4 border-t border-slate-100/60 pb-4">
                    <button
                        @click="handleLogout"
                        class="cursor-pointer w-full flex items-center px-3 py-2.5 text-[15px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group"
                    >
                        <FontAwesomeIcon 
                            class="text-[16px] mr-2 text-slate-400 group-hover:text-slate-900 transition-colors" 
                            :icon="faRightFromBracket"
                        />
                        Sair
                    </button>
                </div>
            </nav>
        </div>
    </aside>
</template>
