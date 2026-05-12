<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import router from '../router';
import { useUser } from '../composables/useUser';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { api } from '../services/api';
import { useToast } from '../composables/useToast';
import BaseButton from './base-button.vue';
import { useRoute } from 'vue-router';
import ConfirmModal from './confirm-modal.vue';

const route  = useRoute();
const { showToast } = useToast();
const { showUser } = useUser();

interface Props {
    data: any[],
    label: string,
    reload: (query: string) => Promise<any>,
    labels: string[],
    resource: string,
    pluralLabel: string,
};

const props = defineProps<Props>();

const selectedItems = ref<string[]>([]);
const listContainer = ref<HTMLElement | null>(null);
const loadingBtn = ref<boolean>(false);
const showModal = ref<boolean>(false);
const loadingModal = ref<boolean>(false);
const dropdownVisible = ref(false);
const dropdownPosition = ref({ top: 0, left: 0 });
const activeDropdownItem = ref<any>({});
const dropdownTimeout = ref<number | null>(null);

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

const handleDeleteMany = async () => {
    if (!selectedItems.value || selectedItems.value.length === 0) {
        return;
    }

    loadingBtn.value = !loadingBtn.value;

    try {
        await deleteApi(selectedItems.value);
        selectedItems.value = [];
        
        const inputs = listContainer.value?.querySelectorAll("input");
        inputs?.forEach((input) => {
            input.checked = false;
        });

        showToast(`${props.pluralLabel} excluídos com sucesso!`, "success");
    } catch (error: any) {
        console.error(`Erro em excluir ${props.pluralLabel.toLocaleLowerCase()}: `, error);
        const apiMessage = error.response?.data;
        showToast(apiMessage || "Ops! Algo deu errado.", "error");
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};

const handleDeleteOne = async () => {
    loadingModal.value = !loadingModal.value;

    try {
        await deleteApi([activeDropdownItem.value.id]);
        showToast(`${props.label} excluído com sucesso!`, "success");
    } catch (error: any) {
        console.error(`Erro ao excluir ${props.label}: `, error);
        const apiMessage = error.response?.data;
        showToast(apiMessage || "Ops! Algo deu errado.", "error");
    } finally {
        showModal.value = !showModal.value;
        loadingModal.value = !loadingModal.value;
    }
};

const deleteApi = async (items: any) => {
    await api({
        url: `/${props.resource}/delete`,
        method: 'delete',
        data: { names: items }
    });

    await props.reload(new URLSearchParams(window.location.search).toString());
};

const showDropdown = (e: MouseEvent, item: any) => {
    if (dropdownTimeout.value) clearTimeout(dropdownTimeout.value);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dropdownPosition.value = {
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 144
    };
    
    activeDropdownItem.value = item;
    dropdownVisible.value = true;
};

const hideDropdown = () => {
    dropdownTimeout.value = window.setTimeout(() => {
        dropdownVisible.value = false;
    }, 100);
};

const cancelHideDropdown = () => {
    if (dropdownTimeout.value) clearTimeout(dropdownTimeout.value);
};

const handleScroll = () => {
    if (dropdownVisible.value) {
        dropdownVisible.value = false;
    }
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll, true);
    window.removeEventListener('resize', handleScroll);
});

watch(() => route.query, () => {
    selectedItems.value = [];

    const inputs = listContainer.value?.querySelectorAll("input");
    inputs?.forEach((input) => {
        input.checked = false;
    });
});
</script>

<template>
    <div ref="listContainer">
        <div class="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
            <div v-if="selectedItems.length > 0" class="bg-blue-600 px-6 py-2.5 flex items-center gap-4">
                <span class="text-white text-[13px] font-medium tracking-wide">Selecionado ({{ selectedItems.length }})</span>
                <BaseButton
                    @click="handleDeleteMany"
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
                                v-if="showUser.permissions.includes(`${resource}:delete`) || showUser.name === 'admin'" 
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
                                v-if="showUser.permissions.includes(`${resource}:delete`) || showUser.name === 'admin'" 
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
                                <button
                                    @mouseenter="showDropdown($event, obj)"
                                    @mouseleave="hideDropdown"
                                    class="p-1 px-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-bold"
                                >
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

    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
        >
            <div 
                v-if="dropdownVisible"
                @mouseenter="cancelHideDropdown"
                @mouseleave="hideDropdown"
                :style="{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }"
                class="absolute w-36 bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-[9999] flex flex-col py-1.5 flex-nowrap origin-top-right"
            >
                <button
                    @click="router.push(`/${resource}/${activeDropdownItem.id}`)" 
                    class="cursor-pointer flex items-center gap-3 px-4 py-2 text-[14px] text-[#0f3050] hover:bg-slate-50 transition-colors w-full text-left"
                >
                    <svg class="w-[18px] h-[18px] text-[#0f3050]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    Visualizar
                </button>
                <button
                    v-if="showUser.permissions.includes(`${resource}:update`) || showUser.name === 'admin'"
                    @click="router.push(`/${resource}/edit/${activeDropdownItem.id}`)" 
                    class="cursor-pointer flex items-center gap-3 px-4 py-2 text-[14px] text-[#0f3050] hover:bg-slate-50 transition-colors w-full text-left"
                >
                    <svg class="w-[18px] h-[18px] text-[#0f3050]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Editar
                </button>
                <button
                    v-if="showUser.permissions.includes(`${resource}:delete`) || showUser.name === 'admin'"
                    @click="() => showModal = true"
                    class="cursor-pointer flex items-center gap-3 px-4 py-2 text-[14px] text-[#b91c1c] hover:bg-red-50 transition-colors w-full text-left"
                >
                    <svg class="w-[18px] h-[18px] text-[#b91c1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Excluir
                </button>
            </div>
        </Transition>
    </Teleport>

    <ConfirmModal 
        :show="showModal"
        :loading="loadingModal"
        :confirm="handleDeleteOne"
        :cancel="() => showModal = false"
        :title="`Excluir ${label}`"
        :message="`Tem certeza que deseja excluir o ${label.toLocaleLowerCase()} ${activeDropdownItem.id}?`"
    />
</template>