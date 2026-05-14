<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseButton from './base-button.vue';
import { api } from '../services/api';
import type { ExportOrder } from '../types/resource';
import { useToast } from '../composables/useToast';
import Dropdown from './dropdown.vue';
import Input from './input.vue';

const { showToast } = useToast();

interface Props {
    isOpen: boolean,
    close: () => void,
    labels: string[],
    orderOptions: ExportOrder[],
    resource: string
};

const props = defineProps<Props>();

const selectedFields = ref<string[]>([...props.labels]);
const orderBy = ref<string>('criacao_recente');
const loadingPDF = ref<boolean>(false);
const maxItems = ref<number>(20);

const toggleField = (label: string) => {
    const index = selectedFields.value.indexOf(label);
    if (index > -1) {
        selectedFields.value.splice(index, 1);
    } else {
        selectedFields.value.push(label);
    }
};

const handleExport = async () => {
    loadingPDF.value = !loadingPDF.value;
    try {
        const orderByLabel = () => {
            return props.orderOptions.find(opt => opt.value === orderBy.value)?.label || '';
        };

        const queryParams = new URLSearchParams({
            fields: selectedFields.value.join(','),
            orderBy: orderBy.value,
            orderByLabel: orderByLabel(),
            maxItems: `${maxItems.value}`
        }).toString();

        const response = await api({
            url: `/${props.resource}/export?${queryParams}`,
            method: 'get',
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio-cargos-${new Date().getTime()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        props.close();
    } catch (error: any) {
        console.error("Erro ao exportar PDF: ", error);
        const apiMessage = error.response?.data;
        showToast(apiMessage || "Ops! Algo deu errado.", "error");
    } finally {
        loadingPDF.value = !loadingPDF.value;
    }
};

watch(() => props.isOpen, () => {
    if (props.isOpen) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "visible";
    }
});
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
            <div v-if="isOpen" @click="!loadingPDF ? close() : null" class="fixed inset-0 bg-slate-900/50 z-[100]"></div>
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
                    <h2 class="text-[28px] font-medium text-slate-800 tracking-tight text-nowrap">Configurar PDF</h2>
                    <button @click="close" class="cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 border border-slate-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <div class="flex flex-col gap-8">
                        <div>
                            <label class="text-[15px] font-medium text-slate-600">Campos Disponíveis</label>
                            <div class="flex flex-col gap-3 mt-3">
                                <label v-for="label in labels" :key="label" class="text-[15px] flex items-center gap-3 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input 
                                        type="checkbox" 
                                        :checked="selectedFields.includes(label)"
                                        @change="toggleField(label)"
                                        class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                    >
                                    <span class="text-slate-700 font-medium">{{ label }}</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <Dropdown 
                                label="Ordenar por"
                                v-model="orderBy"
                                :options="orderOptions"
                            />
                        </div>

                        <div>
                            <Input 
                                label="Quantidade Máxima de Items"
                                placeholder="Ex: 20"
                                v-model.number="maxItems"
                                type="number"
                            />
                        </div>
                    </div>
                </div>

                <div class="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                    <BaseButton 
                        @click="close"
                        :disabled="loadingPDF"
                        class="flex-1 py-3 px-4 rounded-md font-medium text-blue-600 bg-white border border-slate-300 hover:bg-slate-50"
                    >
                        Cancelar
                    </BaseButton>


                    <BaseButton 
                        @click="handleExport"
                        :disabled="loadingPDF"
                        :loading="loadingPDF"
                        class="flex-1 py-3 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Baixar PDF
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
