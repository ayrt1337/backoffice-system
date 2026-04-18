<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import ConfirmModal from '../../components/confirm-modal.vue';
import router from '../../router';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';
import type { RoleData } from '../../types/role';

const { setUser, showUser } = useUser();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resourcesMetadata.roles;

interface Props {
    name: string
};

const props = defineProps<Props>();

const data = ref<RoleData>({
    role: "",
    rolePermissions: [],
    resources: [],
});

const showDeleteModal = ref(false);
const loadingBtn = ref<boolean>(false);

onMounted(async () => {
    try {
        const response = await api({
            url: `/roles/${props.name}`,
            method: 'get'
        });

        data.value = {
            role: response.data.role,
            rolePermissions: response.data.rolePermissions,
            resources: response.data.resources
        };

        setUser(response.data.user);
    } catch (error: any) {
        console.error("Erro ao buscar cargo: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
})

const handleDelete = async () => {
    loadingBtn.value = !loadingBtn.value;
    try {
        await api({
            url: '/roles/delete',
            method: 'delete',
            data: { name: data.value.role }
        });

        showToast("Cargo excluído com sucesso!", "success");
        router.push('/roles');
    } catch(error: any) {
        console.error("Erro ao excluir cargo: ", error);
        showToast("Ops! Algo deu errado.", "error");
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
}
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}` }]"
        />

        <template v-if="data.role !== ''">
            <div class="mt-12">
                <p class="text-[15px] font-medium text-slate-600">Nome do Cargo</p>
                <p class="mt-2 text-[17px]">{{ data.role.name }}</p>
            </div>

            <div class="mt-10">
                <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
            
                <CheckboxPanel 
                    :role="data.role"
                    :selected-permissions="data.rolePermissions"
                    :resources="data.resources"
                    :disabled="true"
                />
            </div>

            <div v-if="data.role !== 'admin'" class="flex gap-3">
                <button 
                    v-if="showUser.permissions.includes('roles:edit') || showUser.name === 'admin'"
                    @click="() => router.push(`/roles/edit/${data.role.name}`)"
                    class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Editar</span>
                </button>

                <button
                    v-if="showUser.permissions.includes('roles:delete') || showUser.name === 'admin'"
                    @click="showDeleteModal = true"
                    class="mt-5 p-2 px-8 rounded-lg bg-red-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-red-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Excluir</span>
                </button>
            </div>

            <div class="mt-12 flex gap-8">
                <div>
                    <p class="text-[15px] font-medium text-slate-600">Criado Em</p>
                    <p class="mt-2 text-[17px]">{{ data.role.created_at }}</p>
                </div>

                <div>
                    <p class="text-[15px] font-medium text-slate-600">Última Alteração</p>
                    <p class="mt-2 text-[17px]">{{ data.role.updated_at }}</p>
                </div>
            </div>

            <ConfirmModal
                :show="showDeleteModal"
                title="Excluir Cargo"
                :message="`Tem certeza que deseja excluir o cargo '${data.role.name}'? Esta ação não pode ser desfeita.`"
                :danger="true"
                @confirm="handleDelete"
                @cancel="showDeleteModal = false"
            />
        </template>

        <div v-else>
            <p class="text-[18px]">Cargo não encontrado</p>
        </div>
    </TemplatePage>
</template>