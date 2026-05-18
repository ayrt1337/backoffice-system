<script setup lang="ts">
import TemplatePage from '../../components/template-page.vue';
import ListHeader from '../../components/list-header.vue';
import { onMounted, ref } from 'vue';
import { useLoading } from '../../composables/use-loading';
import { api } from '../../services/api';
import { verifyApiError } from '../../services/verify-api-error';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faPlus, 
    faPen, 
    faTrash, 
    faRightToBracket, 
    faFileLines,
    faUser,
    faGlobe
} from '@fortawesome/free-solid-svg-icons';
import FilterSidebar from '../../components/filter-sidebar.vue';
import Input from '../../components/input.vue';
import DateInput from '../../components/date-input.vue';
import ExportSidebar from '../../components/export-sidebar.vue';
import { resources } from '../../config/resources';
import type { ExportOrder } from '../../types/resource';
import { useRoute } from 'vue-router';
import Pagination from '../../components/pagination.vue';
import router from '../../router';

const metadata = resources.logs;

const route = useRoute();
const { showLoadingPage } = useLoading();

interface LogAuthor {
    id: string;
    name: string;
    role: string;
    created_at: string;
    updated_at: string;
}

interface LogMessage {
    id: string;
    action: string;
    resource: string;
    author?: LogAuthor | null;
    ip: string;
    targetItem?: any;
    newItem?: any;
    created_at: string;
    message: string;
}

interface FilterProps {
    author: string;
    author_role: string;
    resource: string;
    action: string;
    target_value: string;
    created_at: string;
}

const logs = ref<LogMessage[]>([]);
const showFilter = ref<boolean>(false);
const showExportSidebar = ref<boolean>(false);
const pagination = ref<any>({ current_page: 1, last_page: 1 });

const filter = ref<FilterProps>({
    author: "",
    author_role: "",
    resource: "",
    action: "",
    target_value: "",
    created_at: ""
});

const fetchLogs = async () => {
    try {
        showLoadingPage(true);

        const urlQuery = new URLSearchParams(route.query as Record<string, string>).toString();

        if (urlQuery) {
            var search = urlQuery;
            const filterObj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replaceAll('+', ' ') + '"}');
            delete filterObj["page"];
            filter.value = filterObj as FilterProps;
        }

        await getData(urlQuery);
    } catch (error: any) {
        console.error("Erro ao buscar logs: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
};

onMounted(() => {
    fetchLogs();
});

const getActionConfig = (action: string) => {
    switch (action) {
        case 'create':
            return { icon: faPlus, colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' };
        case 'update':
            return { icon: faPen, colorClass: 'text-blue-600 bg-blue-50 border-blue-200/60' };
        case 'delete':
            return { icon: faTrash, colorClass: 'text-rose-600 bg-rose-50 border-rose-200/60' };
        case 'login':
            return { icon: faRightToBracket, colorClass: 'text-amber-600 bg-amber-50 border-amber-200/60' };
        default:
            return { icon: faFileLines, colorClass: 'text-slate-600 bg-slate-50 border-slate-200/60' };
    }
};

const clearFields = () => {
    filter.value = {
        author: "",
        author_role: "",
        resource: "",
        action: "",
        target_value: "",
        created_at: ""
    };
};

const handleClearFilters = async () => {
    clearFields();
    await getData();
};

const getData = async (query = "") => {
    const response = await api({
        url: `/logs${query ? "?" + query : query}`,
        method: "get",
    });

    logs.value = response.data.data;
    pagination.value = {
        current_page: response.data.pagination.currentPage || 1,
        last_page: response.data.pagination.pages || 1,
        total_items: response.data.pagination.total || 0
    };
};
</script>

<template>
    <TemplatePage>
        <div class="space-y-6">
            <ListHeader 
                title="Trilha de Auditoria"
                :count="pagination.total_items"
                resource="logs"
                :onExport="() => showExportSidebar = true"
                :onFilter="() => showFilter = true"
                :has-not-create="true"
            />

            <div class="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
                <div class="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider px-6 py-4 flex items-center justify-between">
                    <span>Atividade</span>
                    <span>Data e Hora</span>
                </div>

                <div v-if="logs.length > 0" class="divide-y divide-slate-100/80">
                    <div 
                        v-for="log in logs" 
                        :key="log.id"
                        @click="router.push(`/logs/${log.id}`)"
                        class="cursor-pointer px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors duration-200 group"
                    >
                        <div class="flex items-start gap-4">
                            <div :class="['w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform', getActionConfig(log.action).colorClass]">
                                <FontAwesomeIcon :icon="getActionConfig(log.action).icon" class="w-4 h-4" />
                            </div>

                            <div class="space-y-1">
                                <div class="text-slate-800 font-semibold text-[15px] leading-snug">
                                    {{ log.message }}
                                </div>
                                <div class="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                    <span v-if="log.author" class="flex items-center gap-1.5">
                                        <FontAwesomeIcon :icon="faUser" class="w-3 h-3 text-slate-400" />
                                        {{ log.author.name ?? "Desconhecido" }} {{ log.author.role ? `(${log.author.role})` : "" }}
                                    </span>
                                    <span v-else class="flex items-center gap-1.5 text-slate-500 font-semibold">
                                        Sistema / Externo
                                    </span>
                                    <span>•</span>
                                    <span class="flex items-center gap-1.5">
                                        <FontAwesomeIcon :icon="faGlobe" class="w-3 h-3 text-slate-400" />
                                        IP: {{ log.ip }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 text-slate-500 text-sm font-medium self-start sm:self-center whitespace-nowrap pl-14 sm:pl-0">
                            <span>{{ log.created_at }}</span>
                        </div>
                    </div>
                </div>

                <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <h3 class="font-bold text-slate-800">Nenhum resultado encontrado</h3>
                </div>
            </div>
        </div>

        <FilterSidebar 
            :data="filter"
            resource="logs"
            :isOpen="showFilter"
            :close="() => showFilter = false"
            :reset="handleClearFilters"
            :applyFilter="getData"
            :clearFields="clearFields"
        >
            <div class="flex flex-col gap-6">
                <Input 
                    label="Autor (Nome, IP, etc)"
                    v-model="filter.author"
                    placeholder="Ex: admin"
                />

                <Input 
                    label="Cargo do Autor"
                    v-model="filter.author_role"
                    placeholder="Ex: admin"
                />

                <Input 
                    label="Recurso"
                    v-model="filter.resource"
                    placeholder="Ex: users, roles"
                />

                <Input 
                    label="Ação"
                    v-model="filter.action"
                    placeholder="Ex: create, delete"
                />

                <Input 
                    label="Valor do Item (Nome, ID, etc)"
                    v-model="filter.target_value"
                    placeholder="Ex: vendedor"
                />

                <DateInput 
                    label="Data (A partir de)"
                    v-model="filter.created_at"
                />
            </div>
        </FilterSidebar>

        <ExportSidebar 
            :isOpen="showExportSidebar"
            :close="() => showExportSidebar = false"
            :labels="metadata.exportLabels as string[]"
            :orderOptions="metadata.exportOrders as ExportOrder[]"
            resource="logs"
            :plural-label="metadata.pluralLabel"
        />

        <Pagination 
            :currentPage="pagination.current_page"
            :totalPages="pagination.last_page"
            :loadData="fetchLogs"
        />
    </TemplatePage>
</template>