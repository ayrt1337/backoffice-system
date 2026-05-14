<script setup lang="ts">
import { useUser } from '../composables/useUser';
import router from '../router';

const { showUser } = useUser();

interface Props {
    title: string;
    count?: number;
    resource: string;
    onExport: () => void;
    onFilter: () => void;
}

defineProps<Props>();
</script>

<template>
    <div class="w-full flex items-end justify-between mb-8 mt-4">
        <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">{{ title }}</h2>
            <span v-if="count !== undefined" class="bg-slate-100 mt-2 text-slate-500 text-[13px] font-medium px-2 py-0.5 rounded-full">
                {{ count }}
            </span>
        </div>

        <div class="flex items-center gap-3">
            <button
                v-if="showUser.permissions.includes(`${resource}:create`) || showUser.name === 'admin'"
                @click="() => router.push(`/${resource}/create`)"
                class="flex items-center px-4 cursor-pointer h-10 bg-blue-600 text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition-all"
            >
                <span class="text-[18px] text-white leading-none mb-0.5">+&nbsp;</span>Criar Novo
            </button>
            <button 
                @click="onExport"
                class="flex items-center justify-center px-4 h-10 cursor-pointer text-sm font-medium transition-colors rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-slate-700"
            >
                Exportar PDF
            </button>
            <button 
                @click="onFilter" 
                class="flex items-center justify-center size-10 cursor-pointer text-slate-400 hover:text-slate-900 transition-colors rounded-lg border border-slate-200 bg-white"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4.5h18M5.5 12h13M8 19.5h8"></path>
                </svg>
            </button>
        </div>
    </div>
</template>
