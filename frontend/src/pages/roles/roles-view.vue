<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import ConfirmModal from '../../components/confirm-modal.vue';
import router from '../../router';
import { verifyApiError } from '../../services/verify-api-error';
import { useToast } from '../../composables/use-toast';
import { useLoading } from '../../composables/use-loading';
import { useUser } from '../../composables/use-user';
import type { Role, RoleData } from '../../types/role';
import BaseButton from '../../components/base-button.vue';

const { showUser } = useUser();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resourcesMetadata.roles;

interface Props {
    name: string
};

const props = defineProps<Props>();

const data = ref<RoleData>({
    role: {} as Role,
    rolePermissions: [],
    resources: [],
});

const showDeleteModal = ref<boolean>(false);
const loadingExport = ref<boolean>(false);
const loadingBtn = ref<boolean>(false);

const loadData = async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/roles/${props.name}`,
            method: 'get'
        });

        data.value = {
            role: response.data.role,
            rolePermissions: response.data.rolePermissions,
            resources: response.data.resources
        };
    } catch (error: any) {
        console.error("Erro ao buscar cargo: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
};

onMounted(() => {
    loadData();
});

watch(() => props.name, () => {
    loadData();
});

const handleDelete = async () => {
    loadingBtn.value = !loadingBtn.value;
    try {
        await api({
            url: '/roles/delete',
            method: 'delete',
            data: { names: [props.name] }
        });

        await router.push('/roles?page=1');
        showToast("Cargo excluído com sucesso!", "success", true);
    } catch(error: any) {
        console.error("Erro ao excluir cargo: ", error);
        const apiMessage = error.response?.data;
        showToast(apiMessage || "Ops! Algo deu errado.", "error");
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};

const handleExport = async () => {
    loadingExport.value = true;
    try {
        const response = await api({
            url: `/roles/export/${props.name}`,
            method: 'get',
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cargo-${props.name}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
    } catch (error: any) {
        console.error("Erro ao exportar PDF: ", error);
        const apiMessage = error.response?.data;
        showToast(apiMessage || "Ops! Algo deu errado.", "error");
    } finally {
        loadingExport.value = false;
    }
};
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}` }]"
        />

        <template v-if="typeof data.role !== 'string' && data.role.name">
            <div class="mt-12">
                <p class="text-[15px] font-medium text-slate-600">Nome do Cargo</p>
                <p class="mt-2 text-[17px]">{{ (data.role as Role).name }}</p>
            </div>

            <div class="mt-10">
                <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
            
                <CheckboxPanel 
                    :role="(data.role as Role).name"
                    :selected-permissions="data.rolePermissions"
                    :resources="data.resources"
                    :disabled="true"
                />
            </div>

            <div class="max-[490px]:flex-col max-[490px]:gap-6 mt-12 flex gap-8">
                <div>
                    <p class="text-[15px] font-medium text-slate-600">Criado Em</p>
                    <p class="mt-2 text-[17px]">{{ (data.role as Role).created_at }}</p>
                </div>

                <div>
                    <p class="text-[15px] font-medium text-slate-600">Última Alteração</p>
                    <p class="mt-2 text-[17px]">{{ (data.role as Role).updated_at }}</p>
                </div>
            </div>

            <div v-if="(data.role as Role).name !== 'admin'" class="max-[490px]:flex-col mt-10 flex gap-3">
                <BaseButton
                    v-if="showUser.permissions.includes('roles:export') || showUser.name === 'admin'"
                    @click="handleExport"
                    :disabled="loadingExport"
                    :loading="loadingExport"
                    class="p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Exportar</span>
                </BaseButton>

                <BaseButton 
                    v-if="showUser.permissions.includes('roles:update') || showUser.name === 'admin'"
                    @click="() => router.push(`/roles/edit/${(data.role as Role).name}`)"
                    class="p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Editar</span>
                </BaseButton>

                <BaseButton
                    v-if="showUser.permissions.includes('roles:delete') || showUser.name === 'admin'"
                    @click="showDeleteModal = true"
                    class="p-2 px-8 rounded-lg bg-red-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-red-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Excluir</span>
                </BaseButton>
            </div>

            <ConfirmModal
                :show="showDeleteModal"
                :loading="loadingBtn"
                title="Excluir Cargo"
                :message="`Tem certeza que deseja excluir o cargo '${(data.role as Role).name}'? Esta ação não pode ser desfeita.`"
                :danger="true"
                :confirm="handleDelete"
                :cancel="() => showDeleteModal = false"
            />
        </template>

        <div v-else>
            <p class="text-[18px]">Cargo não encontrado</p>
        </div>
    </TemplatePage>
</template>