<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import TemplatePage from '../components/template-page.vue';
import { api } from '../services/api';
import router from '../router';

const users = ref<any>([]);
const loading = ref(true);

const totalUsers = computed(() => users.value.length);

onMounted(async () => {
    try {
        const response = await api({
            url: "/users",
            method: "get",
        });
        
        if (response.status === 200) {
            users.value = response.data.users;
        }
    } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
    } finally {
        loading.value = false;
    }
})

const handleCreate = () => {
    router.push('/users/create');
}
</script>

<template>
    <TemplatePage>
        <!-- Breadcrumbs -->
        <nav class="flex items-center text-xs font-medium text-slate-500 mb-6 space-x-2">
            <span class="hover:text-slate-900 cursor-pointer transition-colors" @click="router.push('/dashboard')">Dashboard</span>
            <span class="text-slate-300">/</span>
            <span class="text-slate-900 font-bold">Usuários</span>
        </nav>

        <!-- Page Header -->
        <div class="flex items-end justify-between mb-8">
            <div class="flex items-center gap-3">
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Usuários</h2>
                <div v-if="!loading" class="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold mt-1.5 shadow-sm">
                    {{ totalUsers }}
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button 
                    @click="handleCreate"
                    class="flex items-center px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95"
                >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Criar Novo
                </button>
                <button class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors rounded-xl border border-slate-200 bg-white hover:border-slate-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4.5h18M5.5 12h13M8 19.5h8"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Content Card/Table -->
        <div class="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            <div v-if="loading" class="flex-1 flex items-center justify-center">
                <div class="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200">
                            <th class="w-12 px-6 py-4">
                                <input type="checkbox" class="rounded-sm border-slate-300 transition-colors cursor-pointer accent-blue-600">
                            </th>
                            <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nome</th>
                            <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                            <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cargo</th>
                            <th class="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50 transition-colors group">
                            <td class="px-6 py-4">
                                <input type="checkbox" class="rounded-sm border-slate-300 transition-colors cursor-pointer accent-blue-600">
                            </td>
                            <td class="px-6 py-4 text-sm font-bold text-slate-800">{{ user.name }}</td>
                            <td class="px-6 py-4 text-xs font-mono text-slate-400">#{{ user.id?.substring(0, 8) || user.id }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                                    {{ user.role.name }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button class="p-1 px-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-bold">
                                    ...
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && users.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0-6a5.99 5.99 0 00-4.846 2.518M18 14l2 2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                    </svg>
                </div>
                <h3 class="text-sm font-bold text-slate-800">Nenhum usuário encontrado</h3>
                <p class="text-xs text-slate-400 mt-1 max-w-[200px]">Comece criando seu primeiro usuário no sistema.</p>
                <button @click="handleCreate" class="mt-6 text-xs font-bold text-blue-600 hover:underline">Adicionar Usuário</button>
            </div>
        </div>
    </TemplatePage>
</template>