<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import BaseButton from '../../components/base-button.vue';
import { useLoading } from '../../composables/use-loading';
import { api } from '../../services/api';
import { verifyApiError } from '../../services/verify-api-error';
import { useToast } from '../../composables/use-toast';
import { resources } from '../../config/resources';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faPlus, 
    faPen, 
    faTrash, 
    faRightToBracket, 
    faFileLines,
    faUser,
    faGlobe,
    faCalendar,
    faDatabase,
} from '@fortawesome/free-solid-svg-icons';

const metadata = resources.logs;
const { showLoadingPage } = useLoading();
const { showToast } = useToast();
const loadingExport = ref(false);

interface LogProps {
    id: string
}

const props = defineProps<LogProps>();
const log = ref();

const loadData = async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/logs/${props.id}`,
            method: 'get'
        });

        log.value = response.data.log;
    } catch (error: any) {
        console.error("Erro ao buscar log: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
};

onMounted(() => {
    loadData();
});

watch(() => props.id, () => {
    loadData();
});

const handleExport = async () => {
    loadingExport.value = true;
    try {
        const response = await api({
            url: `/logs/export/${props.id}`,
            method: 'get',
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditoria-${props.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
    } catch (error: any) {
        console.error("Erro ao exportar PDF: ", error);
        showToast("Erro ao exportar PDF.", "error");
    } finally {
        loadingExport.value = false;
    }
};

const getActionLabel = (action: string) => {
    switch (action) {
        case 'create': return 'Criação';
        case 'update': return 'Edição';
        case 'delete': return 'Exclusão';
        case 'login': return 'Login';
        default: return action;
    }
};

const getActionConfig = (action: string) => {
    switch (action) {
        case 'create':
            return { icon: faPlus, bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
        case 'update':
            return { icon: faPen, bg: 'bg-blue-50 border-blue-200 text-blue-600', badge: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'delete':
            return { icon: faTrash, bg: 'bg-rose-50 border-rose-200 text-rose-600', badge: 'bg-rose-100 text-rose-800 border-rose-200' };
        case 'login':
            return { icon: faRightToBracket, bg: 'bg-amber-50 border-amber-200 text-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-200' };
        default:
            return { icon: faFileLines, bg: 'bg-slate-50 border-slate-200 text-slate-600', badge: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
};

const getResourceLabel = (resource: string) => {
    switch (resource) {
        case 'users': return 'Usuários';
        case 'roles': return 'Cargos';
        case 'logs': return 'Auditoria';
        default: return resource;
    }
};

const getAllKeys = (obj1: any, obj2: any) => {
    const keys = new Set<string>();
    if (obj1 && typeof obj1 === 'object') Object.keys(obj1).forEach(k => keys.add(k));
    if (obj2 && typeof obj2 === 'object') Object.keys(obj2).forEach(k => keys.add(k));
    return Array.from(keys);
};

const formatValue = (val: any) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
};

const isValueChanged = (key: string, oldObj: any, newObj: any) => {
    if (!oldObj || !newObj) return true;
    return JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key]);
};
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: id }]"
        />

        <div v-if="log" class="mt-8 space-y-8 pb-12">
            <div class="bg-white p-6 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                    <div :class="['w-14 h-14 rounded-lg border flex items-center justify-center flex-shrink-0', getActionConfig(log.action).bg]">
                        <FontAwesomeIcon :icon="getActionConfig(log.action).icon" class="w-6 h-6" />
                    </div>
                    <div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-xl font-bold text-slate-800">Evento de Auditoria</h1>
                            <span :class="['px-3 py-1 rounded-full text-xs font-semibold border', getActionConfig(log.action).badge]">
                                {{ getActionLabel(log.action) }}
                            </span>
                        </div>
                        <p class="text-sm text-slate-500 mt-1">Identificador: <span class="font-mono text-slate-600">{{ log.id }}</span></p>
                    </div>
                </div>

                <BaseButton 
                    @click="handleExport"
                    :disabled="loadingExport"
                    class="p-2 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold cursor-pointer transition-all flex justify-center items-center gap-2 hover:bg-blue-700 active:translate-y-0 self-start sm:self-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>{{ loadingExport ? 'Exportando...' : 'Exportar para PDF' }}</span>
                </BaseButton>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white p-5 rounded-lg border border-slate-200/80 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                        <FontAwesomeIcon :icon="faUser" class="w-4 h-4" />
                    </div>
                    <div class="space-y-1 overflow-hidden">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Autor da Ação</p>
                        <p class="text-sm font-semibold text-slate-800 truncate">
                            {{ log.author?.name ?? 'Sistema / Externo' }}
                        </p>
                        <p v-if="log.author?.role" class="text-xs text-slate-500 font-medium truncate">
                            Cargo: {{ log.author.role }}
                        </p>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-lg border border-slate-200/80 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                        <FontAwesomeIcon :icon="faGlobe" class="w-4 h-4" />
                    </div>
                    <div class="space-y-1 overflow-hidden">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço IP</p>
                        <p class="text-sm font-semibold font-mono text-slate-800 truncate">
                            {{ log.ip }}
                        </p>
                        <p class="text-xs text-slate-500 font-medium">Origem da requisição</p>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-lg border border-slate-200/80 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                        <FontAwesomeIcon :icon="faDatabase" class="w-4 h-4" />
                    </div>
                    <div class="space-y-1 overflow-hidden">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Recurso Afetado</p>
                        <p class="text-sm font-semibold text-slate-800 truncate">
                            {{ getResourceLabel(log.resource) }}
                        </p>
                        <p class="text-xs text-slate-500 font-mono font-medium truncate">Tabela: {{ log.resource }}</p>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-lg border border-slate-200/80 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                        <FontAwesomeIcon :icon="faCalendar" class="w-4 h-4" />
                    </div>
                    <div class="space-y-1 overflow-hidden">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Data e Hora</p>
                        <p class="text-sm font-semibold text-slate-800 truncate">
                            {{ log.created_at }}
                        </p>
                        <p class="text-xs text-slate-500 font-medium">Horário do servidor</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
                <div class="bg-slate-50/75 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <h2 class="font-bold text-slate-700 text-base flex items-center gap-2">
                        <FontAwesomeIcon :icon="faFileLines" class="w-4 h-4 text-slate-500" />
                        <span>Detalhes das Alterações (Diff View)</span>
                    </h2>
                    <span class="text-xs text-slate-500 font-medium">Comparação de estado dos dados</span>
                </div>

                <div class="p-6">
                    <div v-if="log.action === 'update'" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="rounded-lg border border-rose-200/80 bg-rose-50/20 overflow-hidden">
                                <div class="bg-rose-100/50 border-b border-rose-200/80 px-4 py-3 flex items-center justify-between">
                                    <span class="font-bold text-rose-800 text-sm flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-rose-600"></span>
                                        Valor Anterior (targetItem)
                                    </span>
                                    <span class="text-xs font-semibold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">Antes</span>
                                </div>
                                <div class="p-4 divide-y divide-rose-100/60 font-mono text-sm">
                                    <div v-for="key in getAllKeys(log.targetItem, log.newItem)" :key="key" class="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                                        <span class="text-slate-500 font-semibold">{{ key }}:</span>
                                        <span :class="['text-slate-800 break-all', isValueChanged(key, log.targetItem, log.newItem) ? 'bg-rose-100/80 text-rose-900 font-bold px-1.5 py-0.5 rounded' : '']">
                                            {{ formatValue(log.targetItem?.[key]) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="rounded-lg border border-blue-200/80 bg-blue-50/20 overflow-hidden">
                                <div class="bg-blue-100/50 border-b border-blue-200/80 px-4 py-3 flex items-center justify-between">
                                    <span class="font-bold text-blue-800 text-sm flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                                        Novo Valor (newItem)
                                    </span>
                                    <span class="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">Depois</span>
                                </div>
                                <div class="p-4 divide-y divide-blue-100/60 font-mono text-sm">
                                    <div v-for="key in getAllKeys(log.targetItem, log.newItem)" :key="key" class="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                                        <span class="text-slate-500 font-semibold">{{ key }}:</span>
                                        <span :class="['text-slate-800 break-all', isValueChanged(key, log.targetItem, log.newItem) ? 'bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded' : '']">
                                            {{ formatValue(log.newItem?.[key]) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="log.action === 'create'" class="rounded-lg border border-emerald-200/80 bg-emerald-50/20 overflow-hidden">
                        <div class="bg-emerald-100/50 border-b border-emerald-200/80 px-4 py-3 flex items-center justify-between">
                            <span class="font-bold text-emerald-800 text-sm flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                                Dados do Registro Criado
                            </span>
                            <span class="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">Novo Registro</span>
                        </div>
                        <div class="p-4 divide-y divide-emerald-100/60 font-mono text-sm">
                            <div v-for="(val, key) in (log.newItem || log.targetItem)" :key="key" class="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span class="text-slate-500 font-semibold">{{ key }}:</span>
                                <span class="text-slate-800 break-all font-medium">{{ formatValue(val) }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="log.action === 'delete'" class="rounded-lg border border-rose-200/80 bg-rose-50/20 overflow-hidden">
                        <div class="bg-rose-100/50 border-b border-rose-200/80 px-4 py-3 flex items-center justify-between">
                            <span class="font-bold text-rose-800 text-sm flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-rose-600"></span>
                                Dados do Registro Excluído
                            </span>
                            <span class="text-xs font-semibold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">Registro Removido</span>
                        </div>
                        <div class="p-4 divide-y divide-rose-100/60 font-mono text-sm">
                            <div v-for="(val, key) in log.targetItem" :key="key" class="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span class="text-slate-500 font-semibold">{{ key }}:</span>
                                <span class="text-slate-800 break-all font-medium">{{ formatValue(val) }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-else class="rounded-lg border border-amber-200/80 bg-amber-50/20 overflow-hidden">
                        <div class="bg-amber-100/50 border-b border-amber-200/80 px-4 py-3 flex items-center justify-between">
                            <span class="font-bold text-amber-800 text-sm flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                                Detalhes do Evento
                            </span>
                            <span class="text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">Informação</span>
                        </div>
                        <div class="p-4 divide-y divide-amber-100/60 font-mono text-sm">
                            <div v-if="log.targetItem" v-for="(val, key) in log.targetItem" :key="key" class="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span class="text-slate-500 font-semibold">{{ key }}:</span>
                                <span class="text-slate-800 break-all font-medium">{{ formatValue(val) }}</span>
                            </div>
                            <div v-else class="py-4 text-center text-slate-500 font-sans italic">
                                Nenhum dado adicional registrado para este evento.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!log">
            <p class="text-[18px]">Registro não encontrado</p>
        </div>
    </TemplatePage>
</template>