<script setup lang="ts">
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faUsers, 
    faShieldHalved, 
    faChartLine, 
    faRightFromBracket, 
    faHome, 
    faClipboardList } 
from '@fortawesome/free-solid-svg-icons';
import router from '../router';
import { api } from '../services/api';
import { useLoading } from '../composables/use-loading';
import { useUser } from '../composables/use-user';
import { useToast } from '../composables/use-toast';
import { computed } from 'vue';
import { useSidebar } from '../composables/use-sidebar';

const { isSidebarOpen, closeSidebar } = useSidebar();
const { showToast } = useToast();
const { showUser } = useUser();
const { showLoadingPage } = useLoading();
const route = useRoute();

const menuItems = [
    { name: 'Home', path: '/home', query: '', icon: faHome, permission: '' },
    { name: 'Dashboard', path: '/dashboard', query: '', icon: faChartLine, permission: 'dashboard:read' },
    { name: 'Usuários', path: '/users', query: '?page=1', icon: faUsers, permission: 'users:read' },
    { name: 'Cargos', path: '/roles', query: '?page=1', icon: faShieldHalved, permission: 'roles:read' },
    { name: 'Auditoria', path: '/logs', query: '?page=1', icon: faClipboardList, permission: 'logs:read' }
];

const filteredItems = computed(() => {
    return menuItems.filter(obj => 
        !obj.permission || showUser.value.permissions.includes(obj.permission) || showUser.value.name === 'admin'
    );
});

const handleLogout = async () => {
    showLoadingPage(true);
    try {
        await api({
            url: "/logout",
            method: "get",
        });

        router.push('/login');
        closeSidebar();
    } catch(error: any) {
        console.error("Erro ao fazer logout: ", error);
        showLoadingPage(false);
        const apiMessage = error.response?.data;
        showToast(apiMessage || "Ops! Algo deu errado.", "error", true);
    }
};
</script>

<template>
    <aside 
        class="fixed inset-y-0 left-0 top-[87px] w-70 bg-white border-r border-slate-200/60 z-30 transition-transform duration-300 lg:translate-x-0"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
        <div class="flex flex-col h-full overflow-y-auto">
            <nav class="flex-1 px-4 py-4 flex flex-col justify-between">
                <div class="space-y-8">
                    <div>
                        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-4">Navegação</h3>
                        <div class="space-y-1">
                            <router-link 
                                v-for="item in filteredItems"
                                :key="item.path"
                                :to="item.path + item.query"
                                @click="closeSidebar"
                                class="flex items-center px-3 py-2 text-[15px] font-medium rounded-xl transition-colors group"
                                :class="route.path === item.path
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                            >
                                <FontAwesomeIcon 
                                    class="text-[16px] mr-2 transition-colors" 
                                    :class="route.path === item.path ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'"
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
