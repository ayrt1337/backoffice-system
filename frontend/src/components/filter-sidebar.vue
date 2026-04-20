<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../services/api';
import { useToast } from '../composables/useToast';
import BaseButton from './base-button.vue';

interface Props {
    data: any,
    resource: string,
    isOpen: boolean;
};

const props = defineProps<Props>();
const { showToast } = useToast();

const emit = defineEmits(['update:isOpen', 'reset', 'apply-filter']);

const close = () => emit('update:isOpen', false);

const loadingSearch = ref(false);
const loadingReset = ref(false);

const search = async () => {
    let allEmpty = true;

    Object.values(props.data).map(value => {
        if (value) {
            allEmpty = false;
            return;
        }
    });
    
    if (!allEmpty) {
        loadingSearch.value = true;
        let query = '';

        Object.entries(props.data).map(([key, value]) => {
            if (value) {
                if (!query) query += `?${key}=${value}`
                else query += `&${key}=${value}`
            }
        });

        try {
            const response = await api({
                url: `/${props.resource}` + query,
                method: "get",
            });

            emit("apply-filter", response.data.data);
            close();
        } catch (error: any) {
            console.error("Erro ao aplicar filtro: ", error);
            showToast("Ops! Algo deu errado.", "error");
        } finally {
            loadingSearch.value = false;
        }
    }
};

const reset = async () => {
    loadingReset.value = true;
    try {
        const response = await api({
            url: `/${props.resource}`,
            method: "get",
        });
        
        emit("reset", response.data.data);
        close();
    } catch (error: any) {
        console.error("Erro ao limpar filtro: ", error);
        showToast("Ops! Algo deu errado.", "error");
    } finally {
        loadingReset.value = false;
    }
};
</script>

<template>
    <div>
        <Transition
            enter-active-class="transition-opacity ease-linear duration-300"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity ease-linear duration-300"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="isOpen" @click="close" class="fixed inset-0 bg-slate-900/50 z-[100]"></div>
        </Transition>

        <Transition
            enter-active-class="transition ease-in-out duration-300 transform"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition ease-in-out duration-300 transform"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
        >
            <div v-if="isOpen" class="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white shadow-xl z-[110] flex flex-col">
                <div class="flex items-center justify-between px-8 py-8">
                    <h2 class="text-[32px] font-medium text-slate-800 tracking-tight">Filtrar</h2>
                    <button @click="close" class="cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 border border-slate-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <slot></slot>
                </div>

                <div class="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                    <BaseButton 
                        @click="reset" 
                        :loading="loadingReset"
                        class="flex-1 py-3 px-4 rounded-md font-medium text-blue-600 bg-white border border-slate-300 hover:bg-slate-50"
                    >
                        Limpar
                    </BaseButton>
                    <BaseButton 
                        @click="search" 
                        :loading="loadingSearch"
                        class="flex-1 py-3 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Pesquisar
                    </BaseButton>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
</style>
