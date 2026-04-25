<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { api } from '../../services/api';
import TemplatePage from '../../components/template-page.vue';
import { resources } from '../../config/resources';
import router from '../../router';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import ConfirmModal from '../../components/confirm-modal.vue';
import type { UserMetadata } from '../../types/user';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';

const { setUser, showUser } = useUser();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resources.users;

interface Props {
    name: string
};

const props = defineProps<Props>();

const userData = ref<Partial<UserMetadata>>({
    name: '',
    role: ''
});

const showDeleteModal = ref<boolean>(false);
const loadingBtn = ref<boolean>(false);

const loadData = async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/users/${props.name}`,
            method: 'get',
        });

        userData.value = {
            name: response.data.userData.name,
            role: response.data.userData.role.name,
            created_at: response.data.userData.created_at,
            updated_at: response.data.userData.updated_at
        };
        setUser(response.data.user);
    } catch (error: any) {
        console.error("Erro em buscar usuário: ", error);
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
            url: '/users/delete',
            method: 'delete',
            data: { names: [props.name] }
        });

        showToast("Usuário excluído com sucesso!", "success");
        router.push("/users");
    } catch (error) {
        console.error("Erro em excluir usuário: ", error);
        showToast("Ops! Algo deu errado.", "error");
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}` }]"
        />

        <template v-if="userData.name !== ''">
            <div class="mt-12">
                <p class="text-[15px] font-medium text-slate-600">Usuário</p>
                <p class="mt-2 text-[17px]">{{ userData.name }}</p>
            </div>

            <div class="mt-10">
                <p class="text-[15px] font-medium text-slate-600">Nome do Cargo</p>
                <p class="mt-2 text-[17px]">{{ userData.role }}</p>
            </div>

            <div class="mt-12 flex gap-8">
                <div>
                    <p class="text-[15px] font-medium text-slate-600">Criado Em</p>
                    <p class="mt-2 text-[17px]">{{ userData.created_at }}</p>
                </div>

                <div>
                    <p class="text-[15px] font-medium text-slate-600">Última Alteração</p>
                    <p class="mt-2 text-[17px]">{{ userData.updated_at }}</p>
                </div>
            </div>

            <div v-if="userData.role !== 'admin'" class="flex mt-10 gap-3">
                <button
                    v-if="showUser.permissions.includes('users:edit') || showUser.name === 'admin'"
                    @click="() => router.push(`/users/edit/${userData.name}`)"
                    class="p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Editar</span>
                </button>

                <button
                    v-if="showUser.permissions.includes('users:delete') || showUser.name === 'admin'"
                    @click="showDeleteModal = true"
                    class="p-2 px-8 rounded-lg bg-red-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-red-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Excluir</span>
                </button>
            </div>

            <ConfirmModal
                :show="showDeleteModal"
                :loading="loadingBtn"
                title="Excluir Usuário"
                :message="`Tem certeza que deseja excluir o usuário '${userData.name}'? Esta ação não pode ser desfeita.`"
                :danger="true"
                :confirm="handleDelete"
                :cancel="() => showDeleteModal = false"
            />
        </template>

        <div v-else>
            <p class="text-[18px]">Usuário não encontrado</p>
        </div>
    </TemplatePage>
</template>