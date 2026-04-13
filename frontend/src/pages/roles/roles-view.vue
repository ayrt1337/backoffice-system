<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import ConfirmModal from '../../components/confirm-modal.vue';
import router from '../../router';
import type { User } from '../../types/user';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';

const { showToast } = useToast();

const metadata = resourcesMetadata.roles;

interface Data {
    role: string,
    rolePermissions: string[],
    resources: any
}

interface Props {
    name: string
};

const props = defineProps<Props>();

const user = ref<User>({
    name: ""
});

const data = ref<Data>({
    role: "",
    rolePermissions: [],
    resources: []
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
            role: response.data.role.name,
            rolePermissions: response.data.rolePermissions,
            resources: response.data.resources
        };

        user.value = response.data.user;
    } catch (error: any) {
        console.error("Erro ao buscar cargo: ", error);
        verifyApiError(error.response.error);
    } finally {
        // showLoading(false);
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
    <TemplatePage :name="user.name">
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${data.role}` }]"
        />

        <div class="mt-15">
            <p class="text-[15px] font-medium text-slate-600">Nome do Cargo</p>
            <p class="mt-2 text-[17px]">{{ data.role }}</p>
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

        <div class="flex">
            <button v-if="data.role !== 'admin'"
                @click="() => router.push(`/roles/edit/${data.role}`)"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span>Editar</span>
            </button>

            <button v-if="data.role !== 'admin'"
                @click="showDeleteModal = true"
                class="mt-5 ml-3 p-2 px-8 rounded-lg bg-red-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-red-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span>Excluir</span>
            </button>
        </div>

        <ConfirmModal
            :show="showDeleteModal"
            title="Excluir Cargo"
            :message="`Tem certeza que deseja excluir o cargo '${data.role}'? Esta ação não pode ser desfeita.`"
            :danger="true"
            @confirm="handleDelete"
            @cancel="showDeleteModal = false"
        />
    </TemplatePage>
</template>