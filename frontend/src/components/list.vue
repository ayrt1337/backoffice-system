<script setup lang="ts">
import { ref } from 'vue';
import router from '../router';

interface Props {
    data: any[],
    label: string,
    labels: string[],
    resource: string,
    pluralLabel: string
};

const props = defineProps<Props>();

const loading = ref<boolean>(false);

const handleCreate = () => {
    router.push(`/${props.resource}/create`);
};
</script>

<template>
    <div class="w-full flex items-end justify-between mb-8 mt-4">
        <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">{{ pluralLabel }}</h2>
        </div>

        <div class="flex items-center gap-3">
            <button 
                @click="handleCreate"
                class="flex items-center px-3.5 cursor-pointer py-2 bg-blue-600 text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition-all"
            >
                <span class="text-[16px]">+&nbsp;</span>Criar Novo
            </button>
            <button class="p-2.5 py-[12px] text-slate-400 hover:text-slate-900 transition-colors rounded-lg border border-slate-200 bg-white hover:border-slate-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4.5h18M5.5 12h13M8 19.5h8"></path>
                </svg>
            </button>
        </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
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
                        <th v-for="label in labels" class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{{ label }}</th>
                        <th class="px-6 py-4 text-right"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr @click="router.push(`/${resource}/${obj.id}`)" v-for="obj in data" class="cursor-pointer">
                        <td class="px-6 py-4">
                            <input type="checkbox" class="rounded-sm border-slate-300 transition-colors cursor-pointer accent-blue-600">
                        </td>
                        <td v-for="value in obj" class="pl-6 py-4">
                            {{ value }}
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

        <div v-if="!loading && data.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0-6a5.99 5.99 0 00-4.846 2.518M18 14l2 2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-800">Nenhum resultado encontrado</h3>
            <button @click="() => router.push(`/${resource}/create`)" class="mt-6 text-xs font-bold text-blue-600 hover:underline">Adicionar {{ label }}</button>
        </div>
    </div>
</template>