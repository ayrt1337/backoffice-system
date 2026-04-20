<script setup lang="ts">
import { ref } from 'vue';
import router from '../router';
import { useUser } from '../composables/useUser';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { api } from '../services/api';
import { useToast } from '../composables/useToast';
import BaseButton from './base-button.vue';

const { showToast } = useToast();
const { showUser } = useUser();

interface Props {
    data: any[],
    label: string,
    labels: string[],
    resource: string,
    pluralLabel: string
};

const props = defineProps<Props>();
const emit = defineEmits(['reload', 'openFilter']);

const selectedItems = ref<string[]>([]);
const listContainer = ref<HTMLElement | null>(null);
const loadingBtn = ref<boolean>(false);

const handleCreate = () => {
    router.push(`/${props.resource}/create`);
};

const selectMany = () => {
    const inputs = listContainer.value?.querySelectorAll("input");

    if (selectedItems.value.length !== props.data.length) {
        inputs?.forEach((input) => {
            input.checked = true;
        });

        selectedItems.value = props.data.map((obj) => {
            return obj.id;
        });
        return;
    }
    
    inputs?.forEach((input) => {
        input.checked = false;
    });

    selectedItems.value = [];
};

const selectOne = (item: string, $event: any) => {
    const inputs = listContainer.value?.querySelectorAll("input");

    if ($event.target.checked) {
        if (selectedItems.value.indexOf(item) === -1) selectedItems.value.push(item);
        
        if (inputs && inputs.length > 0) {
            inputs[0].checked = true;
        }
        return;
    }

    if (selectedItems.value.indexOf(item) > -1) selectedItems.value.splice(selectedItems.value.indexOf(item), 1);

    if (selectedItems.value.length === 0) {
        if (inputs && inputs.length > 0) {
            inputs[0].checked = false;
        }
    }
};

const handleDelete = async () => {
    if (!selectedItems.value || selectedItems.value.length === 0) {
        return;
    }

    loadingBtn.value = !loadingBtn.value;

    try {
        await api({
            url: `/${props.resource}/delete`,
            method: 'delete',
            data: { names: selectedItems.value }
        });

        selectedItems.value = [];
        showToast(`${props.pluralLabel} excluídos com sucesso!`, "success");
        emit('reload');
    } catch (error) {
        console.error(`Erro em excluir ${props.pluralLabel.toLocaleLowerCase()}: `, error);
        showToast("Ops! Algo deu errado.", "error");
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};
</script>

<template>
    <div ref="listContainer">
        <div class="w-full flex items-end justify-between mb-8 mt-4">
            <div class="flex items-center gap-3">
                <h2 class="text-2xl font-bold text-slate-900 tracking-tight">{{ pluralLabel }}</h2>
            </div>

            <div class="flex items-center gap-3">
                <button
                    v-if="showUser.permissions.includes(`${resource}:create`) || showUser.name === 'admin'"
                    @click="handleCreate"
                    class="flex items-center px-3.5 cursor-pointer py-2 bg-blue-600 text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition-all"
                >
                    <span class="text-[16px]">+&nbsp;</span>Criar Novo
                </button>
                <button @click="emit('openFilter')" class="cursor-pointer p-2.5 py-[12px] text-slate-400 hover:text-slate-900 transition-colors rounded-lg border border-slate-200 bg-white hover:border-slate-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4.5h18M5.5 12h13M8 19.5h8"></path>
                    </svg>
                </button>
            </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
            <div v-if="selectedItems.length > 0" class="bg-[#3e47df] px-6 py-2.5 flex items-center gap-4">
                <span class="text-white text-[13px] font-medium tracking-wide">Selecionado ({{ selectedItems.length }})</span>
                <BaseButton
                    @click="handleDelete"
                    :loading="loadingBtn"
                    class="flex items-center gap-1.5 text-white text-[12px] font-medium border border-white/30 rounded-full px-3 py-1 hover:bg-white/10 transition-colors"
                >
                    <FontAwesomeIcon 
                        :icon="faTrash"
                    />
                    Excluir Tudo
                </BaseButton>
            </div>

            <div v-if="data.length !== 0" class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200">
                            <th 
                                v-if="showUser.permissions.includes('users:delete') || showUser.name === 'admin'" 
                                @click.stop class="w-12 px-6 py-4"
                            >
                                <input
                                    @click="selectMany" 
                                    type="checkbox" 
                                    class="size-[17px] rounded-sm border-slate-300 transition-colors cursor-pointer accent-blue-600"
                                >
                            </th>
                            <th v-for="label in labels" class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{{ label }}</th>
                            <th class="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr @click="router.push(`/${resource}/${obj.id}`)" v-for="obj in data" class="cursor-pointer">
                            <td
                                v-if="showUser.permissions.includes('users:delete') || showUser.name === 'admin'" 
                                @click.stop class="px-6 py-4"
                            >
                                <input 
                                    @click="selectOne(obj.id, $event)" 
                                    type="checkbox" 
                                    class="size-[17px] rounded-sm border-slate-300 transition-colors cursor-pointer accent-blue-600"
                                >
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

            <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <h3 class="font-bold text-slate-800">Nenhum resultado encontrado</h3>
                <button @click="() => router.push(`/${resource}/create`)" class="mt-4 cursor-pointer text-sm font-bold text-blue-600 hover:underline">Adicionar {{ label }}</button>
            </div>
        </div>
    </div>
</template>